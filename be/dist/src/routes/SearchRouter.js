"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SearchController_1 = __importDefault(require("../controllers/SearchController"));
const auth_1 = require("../middleware/auth");
class SearchRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.initializeRoutes();
    }
    initializeRoutes() {
        /**
         * POST /api/search
         * Hybrid search endpoint - accessible both authenticated & unauthenticated
         * Authenticated users: search results are saved to history
         * Unauthenticated users: search results are NOT saved
         *
         * Body: { query: string }
         * Headers: Authorization: Bearer <token> (optional)
         * Returns: { success, data, historyId?, message }
         */
        this.router.post("/", (req, res, next) => {
            // Optional auth - continue if token present, otherwise continue anyway
            if (req.headers.authorization) {
                (0, auth_1.verifyToken)(req, res, next);
            }
            else {
                next();
            }
        }, SearchController_1.default.performSearch.bind(SearchController_1.default));
        /**
         * GET /api/search/history/:userId
         * Get search history for authenticated user
         * Only the user can view their own search history
         *
         * Params: userId
         * Query: ?limit=20&offset=0
         * Headers: Authorization: Bearer <token> (required)
         * Returns: { success, data, pagination, message }
         */
        this.router.get("/history/:userId", auth_1.verifyToken, SearchController_1.default.getSearchHistory.bind(SearchController_1.default));
    }
}
exports.default = new SearchRouter().router;
