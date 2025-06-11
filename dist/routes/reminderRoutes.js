"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reminderController_1 = require("../controllers/reminderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authorizeMiddleware_1 = require("../middleware/authorizeMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.get('/all', (0, authorizeMiddleware_1.authorizeRole)('admin'), reminderController_1.getAllRemindersForAdmin);
router.get('/', reminderController_1.getUserReminders);
router.post('/', reminderController_1.createReminder);
router.get('/:id', reminderController_1.getReminderById);
router.put('/:id', reminderController_1.updateReminder);
router.delete('/:id', reminderController_1.deleteReminder);
exports.default = router;
