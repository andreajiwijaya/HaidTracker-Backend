"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const symptomController_1 = require("../controllers/symptomController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authorizeMiddleware_1 = require("../middleware/authorizeMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.get('/', symptomController_1.getSymptoms);
router.get('/:id', symptomController_1.getSymptomById);
router.post('/', symptomController_1.createSymptom);
router.put('/:id', symptomController_1.updateSymptom);
router.delete('/:id', symptomController_1.deleteSymptom);
router.get('/user/:userId', (0, authorizeMiddleware_1.authorizeRole)('admin'), symptomController_1.getSymptomsByUser);
exports.default = router;
