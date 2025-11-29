import { Request, Response } from "express";
import searchGatewayService from "../services/SearchGatewayService";
import { JwtPayload } from "../types/auth.types";
import { Prisma } from "@prisma/client";

// Extend Express Request untuk menyimpan user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

class SearchController {
  /**
   * POST /api/search
   * Endpoint untuk melakukan hybrid search dengan conditional logging
   * Jika user authenticated: simpan ke history
   * Jika user guest: jangan simpan
   */
  async performSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      const userId = req.user?.id;
      const isAuthenticated = !!req.user;

      // Validasi query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Query is required and must be a non-empty string",
        });
        return;
      }

      const result = await searchGatewayService.performHybridSearch({
        userId,
        query: query.trim(),
        isAuthenticated,
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          historyId: result.historyId,
          message: isAuthenticated
            ? "Search completed and saved to history"
            : "Search completed (not saved - unauthenticated user)",
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * GET /api/search/history/:userId
   * Mendapatkan search history pengguna (hanya untuk authenticated users)
   */
  async getSearchHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // Check authorization
      if (req.user?.id !== userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized to view this user's history",
        });
        return;
      }

      const result = await searchGatewayService.getUserSearchHistory(
        userId,
        Number(limit),
        Number(offset)
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch search history",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * POST /api/predict/jaccard
   * Endpoint untuk Jaccard similarity search
   */
  async performJaccardSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      // Validasi query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Query is required and must be a non-empty string",
        });
        return;
      }

      const result = await searchGatewayService.performJaccardSearch(
        query.trim()
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Jaccard search error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * POST /api/predict
   * Endpoint untuk TF-IDF vector space model search
   */
  async performVectorSpaceSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      // Validasi query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Query is required and must be a non-empty string",
        });
        return;
      }

      const result = await searchGatewayService.performVectorSpaceSearch(
        query.trim()
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Vector space search error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * POST /api/evaluate
   * Endpoint untuk evaluasi model (precision, recall, F1)
   */
  async performModelEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const { y_true, y_pred } = req.body;

      if (!Array.isArray(y_true) || !Array.isArray(y_pred)) {
        res.status(400).json({
          success: false,
          message: "y_true and y_pred must be arrays",
        });
        return;
      }

      if (y_true.length === 0 || y_pred.length === 0) {
        res.status(400).json({
          success: false,
          message: "y_true and y_pred cannot be empty",
        });
        return;
      }

      if (y_true.length !== y_pred.length) {
        res.status(400).json({
          success: false,
          message: "y_true and y_pred must have the same length",
        });
        return;
      }

      const result = await searchGatewayService.performModelEvaluation(
        y_true,
        y_pred
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Model evaluation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new SearchController();
