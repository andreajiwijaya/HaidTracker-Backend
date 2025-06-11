"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticController_1 = require("../controllers/analyticController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authorizeMiddleware_1 = require("../middleware/authorizeMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.get('/all', (0, authorizeMiddleware_1.authorizeRole)('admin'), analyticController_1.getAllAnalyticsForAdmin);
router.get('/', analyticController_1.getUserAnalytics);
router.post('/', analyticController_1.createAnalytic);
router.get('/:id', analyticController_1.getAnalyticById);
router.put('/:id', analyticController_1.updateAnalytic);
router.delete('/:id', analyticController_1.deleteAnalytic);
exports.default = router;
