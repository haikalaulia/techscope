"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
class SearchHistoryController {
    /**
     * Menyimpan riwayat pencarian untuk pengguna yang authenticated
     */
    async saveSearchHistory(req, res) {
        try {
            const { userId, query, processedQuery, resultsJson } = req.body;
            if (!userId || !query || !processedQuery || !resultsJson) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                });
                return;
            }
            // Verifikasi user ada di database
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }
            const searchHistory = await prisma_1.prisma.searchHistory.create({
                data: {
                    userId,
                    query,
                    processedQuery,
                    resultsJson,
                },
            });
            res.status(201).json({
                success: true,
                message: "Search history saved successfully",
                data: searchHistory,
            });
        }
        catch (error) {
            console.error("Error saving search history:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    /**
     * Mendapatkan riwayat pencarian pengguna
     */
    async getSearchHistory(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 20, offset = 0 } = req.query;
            // Validasi userId
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }
            // Verifikasi user ada
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }
            // Ambil search history dengan pagination
            const [searchHistories, totalCount] = await Promise.all([
                prisma_1.prisma.searchHistory.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                    take: Number(limit),
                    skip: Number(offset),
                }),
                prisma_1.prisma.searchHistory.count({
                    where: { userId },
                }),
            ]);
            res.status(200).json({
                success: true,
                message: "Search history retrieved successfully",
                data: searchHistories,
                pagination: {
                    total: totalCount,
                    limit: Number(limit),
                    offset: Number(offset),
                    hasMore: Number(offset) + Number(limit) < totalCount,
                },
            });
        }
        catch (error) {
            console.error("Error retrieving search history:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    /**
     * Menghapus satu search history
     */
    async deleteSearchHistory(req, res) {
        try {
            const { historyId } = req.params;
            const { userId } = req.body;
            if (!historyId || !userId) {
                res.status(400).json({
                    success: false,
                    message: "History ID and User ID are required",
                });
                return;
            }
            // Cek apakah history milik user
            const history = await prisma_1.prisma.searchHistory.findUnique({
                where: { id: historyId },
            });
            if (!history) {
                res.status(404).json({
                    success: false,
                    message: "Search history not found",
                });
                return;
            }
            if (history.userId !== userId) {
                res.status(403).json({
                    success: false,
                    message: "Unauthorized to delete this history",
                });
                return;
            }
            await prisma_1.prisma.searchHistory.delete({
                where: { id: historyId },
            });
            res.status(200).json({
                success: true,
                message: "Search history deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting search history:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    /**
     * Menghapus semua search history pengguna
     */
    async clearSearchHistory(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }
            // Verifikasi user ada
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }
            const result = await prisma_1.prisma.searchHistory.deleteMany({
                where: { userId },
            });
            res.status(200).json({
                success: true,
                message: "All search histories cleared successfully",
                data: {
                    deletedCount: result.count,
                },
            });
        }
        catch (error) {
            console.error("Error clearing search history:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
exports.default = new SearchHistoryController();
