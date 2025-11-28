"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SearchGatewayService_1 = __importDefault(require("../services/SearchGatewayService"));
class SearchController {
    /**
     * POST /api/search
     * Endpoint untuk melakukan hybrid search dengan conditional logging
     * Jika user authenticated: simpan ke history
     * Jika user guest: jangan simpan
     */
    async performSearch(req, res) {
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
            // Perform search via gateway service
            const result = await SearchGatewayService_1.default.performHybridSearch({
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
            }
            else {
                res.status(500).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                });
            }
        }
        catch (error) {
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
    async getSearchHistory(req, res) {
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
            const result = await SearchGatewayService_1.default.getUserSearchHistory(userId, Number(limit), Number(offset));
            res.status(200).json(result);
        }
        catch (error) {
            console.error("Error fetching search history:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch search history",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
exports.default = new SearchController();
