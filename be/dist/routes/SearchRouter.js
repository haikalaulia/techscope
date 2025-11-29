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
         * Authenticated users: search results are saved to history as type "hybrid"
         * Unauthenticated users: search results are NOT saved
         *
         * Body: { query: string }
         * Headers: Authorization: Bearer <token> (optional)
         * Returns: { success, data, historyId?, message }
         */
        this.router.post("/", (req, res, next) => {
            if (req.headers.authorization) {
                (0, auth_1.verifyToken)(req, res, next);
            }
            else {
                next();
            }
        }, SearchController_1.default.performSearch.bind(SearchController_1.default));
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
        this.router.post("/predict", (req, res, next) => {
            if (req.headers.authorization) {
                (0, auth_1.verifyToken)(req, res, next);
            }
            else {
                next();
            }
        }, SearchController_1.default.performVectorSpaceSearch.bind(SearchController_1.default));
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
        this.router.post("/predict/jaccard", (req, res, next) => {
            if (req.headers.authorization) {
                (0, auth_1.verifyToken)(req, res, next);
            }
            else {
                next();
            }
        }, SearchController_1.default.performJaccardSearch.bind(SearchController_1.default));
        /**
         * POST /api/evaluate
         * Model evaluation endpoint - accessible to all users
         * Calculates precision, recall, and F1 score
         *
         * Body: { y_true: array, y_pred: array }
         * Returns: { success, data: { precision, recall, f1 }, message }
         */
        this.router.post("/evaluate", SearchController_1.default.performModelEvaluation.bind(SearchController_1.default));
        /**
         * GET /api/products/:id
         * Mendapatkan detail lengkap produk berdasarkan ID
         * Accessible untuk semua user (authenticated & unauthenticated)
         *
         * Params: id (product ID)
         * Returns: { success, data: { id, title, image, content, specs, price, info } }
         */
        this.router.get("/products/:id", SearchController_1.default.getProductDetail.bind(SearchController_1.default));
    }
}
exports.default = new SearchRouter().router;
