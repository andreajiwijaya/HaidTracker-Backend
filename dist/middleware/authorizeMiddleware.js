"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.userRole) {
            res.status(401).json({ error: 'User role not found, unauthorized' });
            return;
        }
        if (req.userRole !== requiredRole) {
            res.status(403).json({ error: 'Forbidden: insufficient rights' });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
