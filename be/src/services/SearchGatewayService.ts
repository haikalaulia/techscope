import axios, { AxiosInstance } from "axios";
import { prisma } from "../lib/prisma";

interface FlaskSearchResult {
  query: string;
  processedQuery: string;
  results: any[];
  metadata?: {
    executionTime?: number;
    totalResults?: number;
  };
}

interface GatewaySearchRequest {
  userId?: string;
  query: string;
  isAuthenticated: boolean;
  type?: "hybrid" | "jaccard" | "vector"; // default: hybrid
}

interface GatewaySearchResponse {
  success: boolean;
  data?: FlaskSearchResult;
  historyId?: string;
  message: string;
  error?: string;
}

class SearchGatewayService {
  private flaskClient: AxiosInstance;

  constructor() {
    this.flaskClient = axios.create({
      baseURL: process.env.FLASK_API_URL || "http://localhost:5001",
      timeout: 30000,
    });
  }
  private cleanNaNValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.cleanNaNValues(item));
    }

    if (typeof obj === "object") {
      const cleaned: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          // Ganti NaN, undefined dengan null
          if (typeof value === "number" && isNaN(value)) {
            cleaned[key] = null;
          } else if (value === "NaN" || value === "Nan") {
            cleaned[key] = null;
          } else {
            cleaned[key] = this.cleanNaNValues(value);
          }
        }
      }
      return cleaned;
    }

    return obj;
  }

  /**
   * Helper: Safe JSON parse dengan NaN handling
   */
  private safeJSONParse(jsonString: string): any {
    try {
      // Replace NaN dengan null sebelum parse
      const cleaned = jsonString
        .replace(/:\s*NaN/g, ": null")
        .replace(/:\s*"NaN"/g, ": null")
        .replace(/:\s*Infinity/g, ": null")
        .replace(/:\s*-Infinity/g, ": null");

      return JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      throw e;
    }
  }

  /**
   * Unified search method yang support multiple search types
   * @param request Request dari user dengan type parameter
   * @returns Response dengan hasil pencarian dan history ID jika disimpan
   */
  async performSearch(
    request: GatewaySearchRequest
  ): Promise<GatewaySearchResponse> {
    const searchType = request.type || "hybrid";

    try {
      let flaskEndpoint: string;
      let flaskPayload: any;

      // Determine Flask endpoint berdasarkan search type
      switch (searchType) {
        case "jaccard":
          flaskEndpoint = "/predict_jaccard";
          flaskPayload = { query: request.query };
          break;
        case "vector":
          flaskEndpoint = "/predict";
          flaskPayload = { query: request.query };
          break;
        case "hybrid":
        default:
          flaskEndpoint = "/search";
          flaskPayload = { query: request.query };
      }

      // Call Flask API
      const flaskResponse = await this.flaskClient.post<any>(
        flaskEndpoint,
        flaskPayload
      );

      let searchResult = flaskResponse.data;
      if (typeof flaskResponse.data === "string") {
        searchResult = this.safeJSONParse(flaskResponse.data);
      }

      // Clean NaN values
      const cleanedResult = this.cleanNaNValues(searchResult);

      // Save to history jika authenticated
      let historyId: string | undefined;
      if (request.isAuthenticated && request.userId) {
        const history = await prisma.searchHistory.create({
          data: {
            userId: request.userId,
            query: request.query,
            processedQuery: cleanedResult.processedQuery || request.query,
            resultsJson: {
              type: searchType,
              ...cleanedResult,
            } as any,
          },
        });
        historyId = history.id;
      }

      return {
        success: true,
        data: cleanedResult,
        historyId,
        message: `${searchType} search completed successfully`,
      };
    } catch (error) {
      console.error(`${searchType} Search Error:`, error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: `Error connecting to ${searchType} search service`,
          error: error.message,
        };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Legacy: Melakukan hybrid search dan conditional logging ke database
   * @param request Request dari user (termasuk userId jika authenticated)
   * @returns Response dengan hasil pencarian dan history ID jika disimpan
   * @deprecated Use performSearch with type="hybrid" instead
   */
  async performHybridSearch(
    request: GatewaySearchRequest
  ): Promise<GatewaySearchResponse> {
    return this.performSearch(request);
  }

  /**
   * Alternative method: Simpan history secara terpisah setelah search selesai
   * Berguna jika Flask response lambat
   */
  async saveSearchHistoryAsync(
    userId: string,
    query: string,
    processedQuery: string,
    resultsJson: any
  ): Promise<string> {
    try {
      const history = await prisma.searchHistory.create({
        data: {
          userId,
          query,
          processedQuery,
          resultsJson,
        },
      });
      return history.id;
    } catch (error) {
      console.error("Error saving search history:", error);
      throw error;
    }
  }

  async getUserSearchHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      const [histories, total] = await Promise.all([
        prisma.searchHistory.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.searchHistory.count({ where: { userId } }),
      ]);

      return {
        success: true,
        data: histories,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      console.error("Error fetching search history:", error);
      throw error;
    }
  }

  /**
   * Predict Jaccard - Endpoint untuk Jaccard similarity search
   * @param query Query string dari user
   * @returns Hasil Jaccard similarity dengan top 10 produk
   * @deprecated Use performSearch with type="jaccard" instead
   */
  async performJaccardSearch(query: string): Promise<GatewaySearchResponse> {
    return this.performSearch({
      query,
      isAuthenticated: false,
      type: "jaccard",
    });
  }

  /**
   * Evaluate - Endpoint untuk evaluasi model (precision, recall, F1)
   * @param y_true Array of true labels
   * @param y_pred Array of predicted labels
   * @returns Metrics (precision, recall, f1)
   */
  async performModelEvaluation(
    y_true: any[],
    y_pred: any[]
  ): Promise<GatewaySearchResponse> {
    try {
      const flaskResponse = await this.flaskClient.post<any>("/evaluate", {
        y_true,
        y_pred,
      });

      // Parse data jika berupa string JSON
      let parsedData = flaskResponse.data;
      if (typeof flaskResponse.data === "string") {
        parsedData = this.safeJSONParse(flaskResponse.data);
      }

      // Clean NaN values
      parsedData = this.cleanNaNValues(parsedData);

      return {
        success: true,
        data: parsedData,
        message: "Model evaluation completed successfully",
      };
    } catch (error) {
      console.error("Evaluation Error:", error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: "Error connecting to evaluation service",
          error: error.message,
        };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get detail produk dari Flask berdasarkan ID
   * @param id ID produk (string / number)
   */
  async getDetailById(id: string) {
    try {
      const response = await this.flaskClient.get(`/detail/${id}`);

      let result = response.data;

      if (typeof result === "string") {
        result = this.safeJSONParse(result);
      }

      // Clean NaN values
      const cleaned = this.cleanNaNValues(result);

      return {
        success: true,
        data: cleaned.data,
        message: "Detail fetched successfully",
      };
    } catch (error: any) {
      console.error("Detail Fetch Error:", error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: "Error connecting to Flask detail service",
          error: error.message,
        };
      }

      return {
        success: false,
        message: "Unexpected error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Predict Vector Space - Endpoint untuk TF-IDF vector space model
   * @param query Query string dari user
   * @returns Hasil search menggunakan TF-IDF
   * @deprecated Use performSearch with type="vector" instead
   */
  async performVectorSpaceSearch(
    query: string
  ): Promise<GatewaySearchResponse> {
    return this.performSearch({
      query,
      isAuthenticated: false,
      type: "vector",
    });
  }
}

export default new SearchGatewayService();
