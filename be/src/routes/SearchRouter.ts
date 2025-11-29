import express, { Router } from "express";
import searchController from "../controllers/SearchController";
import { verifyToken } from "../middleware/auth";

class SearchRouter {
  public router: Router;

  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * POST /api/search
     * Hybrid search endpoint - accessible both authenticated & unauthenticated
     * Authenticated users: search results are saved to history as type "hybrid"
     * Unauthenticated users: search results are NOT saved
     *
     * Body: { query: string }
     * Headers: Authorization: Bearer <token> (optional)
     * Returns: { success, data, historyId?, message }
     */
    this.router.post(
      "/",
      (req, res, next) => {
        if (req.headers.authorization) {
          verifyToken(req, res, next);
        } else {
          next();
        }
      },
      searchController.performSearch.bind(searchController)
    );

    /**
     * POST /api/predict
     * Vector space (TF-IDF) search endpoint
     * Authenticated users: search results are saved to history as type "vector"
     * Unauthenticated users: search results are NOT saved
     *
     * Body: { query: string }
     * Headers: Authorization: Bearer <token> (optional)
     * Returns: { success, data, historyId?, message }
     */
    this.router.post(
      "/predict",
      (req, res, next) => {
        if (req.headers.authorization) {
          verifyToken(req, res, next);
        } else {
          next();
        }
      },
      searchController.performVectorSpaceSearch.bind(searchController)
    );

    /**
     * POST /api/predict/jaccard
     * Jaccard similarity search endpoint
     * Authenticated users: search results are saved to history as type "jaccard"
     * Unauthenticated users: search results are NOT saved
     *
     * Body: { query: string }
     * Headers: Authorization: Bearer <token> (optional)
     * Returns: { success, data, historyId?, message }
     */
    this.router.post(
      "/predict/jaccard",
      (req, res, next) => {
        if (req.headers.authorization) {
          verifyToken(req, res, next);
        } else {
          next();
        }
      },
      searchController.performJaccardSearch.bind(searchController)
    );

    /**
     * POST /api/evaluate
     * Model evaluation endpoint - accessible to all users
     * Calculates precision, recall, and F1 score
     *
     * Body: { y_true: array, y_pred: array }
     * Returns: { success, data: { precision, recall, f1 }, message }
     */
    this.router.post(
      "/evaluate",
      searchController.performModelEvaluation.bind(searchController)
    );
  }
}

export default new SearchRouter().router;
