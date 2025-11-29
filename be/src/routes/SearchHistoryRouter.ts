import express, { Router } from "express";
import { verifyToken } from "../middleware/auth";
import searchHistoryController from "../controllers/SearchHistoryController";

class SearchHistoryRouter {
  public router: Router;

  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * POST /api/search-history
     * Menyimpan riwayat pencarian (hanya untuk authenticated users)
     * Body: { userId, query, processedQuery, resultsJson }
     */
    this.router.post(
      "/",
      verifyToken,
      searchHistoryController.saveSearchHistory.bind(searchHistoryController)
    );

    /**
     * GET /api/search-history/:userId/hybrid
     * Mengambil riwayat hybrid search pengguna (hanya untuk authenticated users)
     * Query params: ?limit=20&offset=0
     */
    this.router.get(
      "/:userId/hybrid",
      verifyToken,
      searchHistoryController.getHybridSearchHistory.bind(
        searchHistoryController
      )
    );

    /**
     * GET /api/search-history/:userId/jaccard
     * Mengambil riwayat jaccard search pengguna (hanya untuk authenticated users)
     * Query params: ?limit=20&offset=0
     */
    this.router.get(
      "/:userId/jaccard",
      verifyToken,
      searchHistoryController.getJaccardSearchHistory.bind(
        searchHistoryController
      )
    );

    /**
     * GET /api/search-history/:userId/vector
     * Mengambil riwayat vector (TF-IDF) search pengguna (hanya untuk authenticated users)
     * Query params: ?limit=20&offset=0
     */
    this.router.get(
      "/:userId/vector",
      verifyToken,
      searchHistoryController.getVectorSearchHistory.bind(
        searchHistoryController
      )
    );

    /**
     * GET /api/search-history/:userId
     * Mengambil semua riwayat pencarian pengguna (hanya untuk authenticated users)
     * Query params: ?limit=20&offset=0
     */
    this.router.get(
      "/:userId",
      verifyToken,
      searchHistoryController.getSearchHistory.bind(searchHistoryController)
    );

    /**
     * DELETE /api/search-history/:historyId
     * Menghapus satu riwayat pencarian (hanya untuk authenticated users)
     * Body: { userId }
     */
    this.router.delete(
      "/:historyId",
      verifyToken,
      searchHistoryController.deleteSearchHistory.bind(searchHistoryController)
    );

    /**
     * DELETE /api/search-history/clear/:userId
     * Menghapus semua riwayat pencarian pengguna (hanya untuk authenticated users)
     * Body: { userId }
     */
    this.router.delete(
      "/clear/:userId",
      verifyToken,
      searchHistoryController.clearSearchHistory.bind(searchHistoryController)
    );
  }
}

export default new SearchHistoryRouter().router;
