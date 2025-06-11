"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cycleController_1 = require("../controllers/cycleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authorizeMiddleware_1 = require("../middleware/authorizeMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.get('/', cycleController_1.getCycles);
router.get('/search', cycleController_1.searchCycles);
router.get('/stats', (0, authorizeMiddleware_1.authorizeRole)('admin'), cycleController_1.getCycleStats);
router.get('/:id', cycleController_1.getCycleById);
router.post('/', cycleController_1.createCycle);
router.put('/:id', cycleController_1.updateCycle);
router.delete('/:id', cycleController_1.deleteCycle);
exports.default = router;
