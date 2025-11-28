"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const SearchHistoryController_1 = __importDefault(require("../controllers/SearchHistoryController"));
class SearchHistoryRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.initializeRoutes();
    }
    initializeRoutes() {
        /**
         * POST /api/search-history
         * Menyimpan riwayat pencarian (hanya untuk authenticated users)
         * Body: { userId, query, processedQuery, resultsJson }
         */
        this.router.post("/", auth_1.verifyToken, SearchHistoryController_1.default.saveSearchHistory.bind(SearchHistoryController_1.default));
        /**
         * GET /api/search-history/:userId
         * Mengambil riwayat pencarian pengguna (hanya untuk authenticated users)
         * Query params: ?limit=20&offset=0
         */
        this.router.get("/:userId", auth_1.verifyToken, SearchHistoryController_1.default.getSearchHistory.bind(SearchHistoryController_1.default));
        /**
         * DELETE /api/search-history/:historyId
         * Menghapus satu riwayat pencarian (hanya untuk authenticated users)
         * Body: { userId }
         */
        this.router.delete("/:historyId", auth_1.verifyToken, SearchHistoryController_1.default.deleteSearchHistory.bind(SearchHistoryController_1.default));
        /**
         * DELETE /api/search-history/clear/:userId
         * Menghapus semua riwayat pencarian pengguna (hanya untuk authenticated users)
         * Body: { userId }
         */
        this.router.delete("/clear/:userId", auth_1.verifyToken, SearchHistoryController_1.default.clearSearchHistory.bind(SearchHistoryController_1.default));
    }
}
exports.default = new SearchHistoryRouter().router;
