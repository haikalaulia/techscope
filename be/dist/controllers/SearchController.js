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
            const result = await SearchGatewayService_1.default.performSearch({
                userId,
                query: query.trim(),
                isAuthenticated,
                type: "hybrid",
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
     * POST /api/predict/jaccard
     * Endpoint untuk Jaccard similarity search
     * Jika user authenticated: simpan ke history sebagai type "jaccard"
     * Jika user guest: jangan simpan
     */
    async performJaccardSearch(req, res) {
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
            const result = await SearchGatewayService_1.default.performSearch({
                userId,
                query: query.trim(),
                isAuthenticated,
                type: "jaccard",
            });
            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                    historyId: result.historyId,
                    message: result.message,
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
     * Jika user authenticated: simpan ke history sebagai type "vector"
     * Jika user guest: jangan simpan
     */
    async performVectorSpaceSearch(req, res) {
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
            const result = await SearchGatewayService_1.default.performSearch({
                userId,
                query: query.trim(),
                isAuthenticated,
                type: "vector",
            });
            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                    historyId: result.historyId,
                    message: result.message,
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
    async performModelEvaluation(req, res) {
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
            const result = await SearchGatewayService_1.default.performModelEvaluation(y_true, y_pred);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                    message: result.message,
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
            console.error("Model evaluation error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    /**
     * GET /api/products/:id
     * Mendapatkan detail lengkap produk berdasarkan ID
     * Accessible untuk semua user (authenticated & unauthenticated)
     */
    async getProductDetail(req, res) {
        try {
            const { id } = req.params;
            // Validasi ID
            if (!id || isNaN(Number(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
                return;
            }
            const result = await SearchGatewayService_1.default.getProductDetail(Number(id));
            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                });
            }
        }
        catch (error) {
            console.error("Error fetching product detail:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
exports.default = new SearchController();
