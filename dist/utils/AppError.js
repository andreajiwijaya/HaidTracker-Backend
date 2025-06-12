"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.default = AppError;
