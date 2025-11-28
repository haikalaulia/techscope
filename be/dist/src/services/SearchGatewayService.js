"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SearchGatewayService {
    constructor() {
        this.flaskClient = axios_1.default.create({
            baseURL: process.env.FLASK_API_URL || "http://localhost:5001",
            timeout: 30000,
        });
    }
    /**
     * Melakukan hybrid search dan conditional logging ke database
     * @param request Request dari user (termasuk userId jika authenticated)
     * @returns Response dengan hasil pencarian dan history ID jika disimpan
     */
    async performHybridSearch(request) {
        try {
            // 1. Call Flask API untuk melakukan hybrid search
            const flaskResponse = await this.flaskClient.post("/api/search", {
                query: request.query,
            });
            const searchResult = flaskResponse.data;
            // 2. Jika user authenticated, simpan ke search history
            let historyId;
            if (request.isAuthenticated && request.userId) {
                const history = await prisma.searchHistory.create({
                    data: {
                        userId: request.userId,
                        query: request.query,
                        processedQuery: searchResult.processedQuery || request.query,
                        resultsJson: searchResult,
                    },
                });
                historyId = history.id;
            }
            return {
                success: true,
                data: searchResult,
                historyId,
                message: "Search completed successfully",
            };
        }
        catch (error) {
            console.error("Search Gateway Error:", error);
            if (axios_1.default.isAxiosError(error)) {
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
    async saveSearchHistoryAsync(userId, query, processedQuery, resultsJson) {
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
        }
        catch (error) {
            console.error("Error saving search history:", error);
            throw error;
        }
    }
    /**
     * Get user's search history dengan pagination
     */
    async getUserSearchHistory(userId, limit = 20, offset = 0) {
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
        }
        catch (error) {
            console.error("Error fetching search history:", error);
            throw error;
        }
    }
}
exports.default = new SearchGatewayService();
