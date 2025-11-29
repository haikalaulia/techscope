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

  /**
   * Helper: Clean NaN values dari response Flask
   * NaN dari pandas DataFrame tidak valid dalam JSON
   */
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
   * Melakukan hybrid search dan conditional logging ke database
   * @param request Request dari user (termasuk userId jika authenticated)
   * @returns Response dengan hasil pencarian dan history ID jika disimpan
   */
  async performHybridSearch(
    request: GatewaySearchRequest
  ): Promise<GatewaySearchResponse> {
    try {
      // 1. Call Flask API untuk melakukan hybrid search
      // Note: Flask endpoint adalah /search (bukan /api/search)
      const flaskResponse = await this.flaskClient.post<FlaskSearchResult>(
        "/search",
        {
          query: request.query,
        }
      );

      const searchResult = flaskResponse.data;

      // Clean NaN values dari Flask response
      const cleanedResult = this.cleanNaNValues(searchResult);

      // 2. Jika user authenticated, simpan ke search history
      let historyId: string | undefined;
      if (request.isAuthenticated && request.userId) {
        const history = await prisma.searchHistory.create({
          data: {
            userId: request.userId,
            query: request.query,
            processedQuery: cleanedResult.processedQuery || request.query,
            resultsJson: cleanedResult as any,
          },
        });
        historyId = history.id;
      }

      return {
        success: true,
        data: cleanedResult,
        historyId,
        message: "Search completed successfully",
      };
    } catch (error) {
      console.error("Search Gateway Error:", error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: "Error connecting to search service",
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
   */
  async performJaccardSearch(query: string): Promise<GatewaySearchResponse> {
    try {
      const flaskResponse = await this.flaskClient.post<any>(
        "/predict_jaccard",
        { query }
      );

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
        message: "Jaccard search completed successfully",
      };
    } catch (error) {
      console.error("Jaccard Search Error:", error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: "Error connecting to Jaccard search service",
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
   * Predict Vector Space - Endpoint untuk TF-IDF vector space model
   * @param query Query string dari user
   * @returns Hasil search menggunakan TF-IDF
   */
  async performVectorSpaceSearch(
    query: string
  ): Promise<GatewaySearchResponse> {
    try {
      const flaskResponse = await this.flaskClient.post<any>("/predict", {
        query,
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
        message: "Vector space search completed successfully",
      };
    } catch (error) {
      console.error("Vector Space Search Error:", error);

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: "Error connecting to vector space search service",
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
}

export default new SearchGatewayService();
