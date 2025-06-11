"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = void 0;
const userService = __importStar(require("../services/userService"));
// Create user (only admin)
const createUser = async (req, res) => {
    await userService.createUser(req, res);
};
exports.createUser = createUser;
// Get user by id (admin or self)
const getUserById = async (req, res) => {
    await userService.getUserById(req, res);
};
exports.getUserById = getUserById;
// Update user (admin or self)
const updateUser = async (req, res) => {
    await userService.updateUser(req, res);
};
exports.updateUser = updateUser;
// Delete user (admin or self)
const deleteUser = async (req, res) => {
    await userService.deleteUser(req, res);
};
exports.deleteUser = deleteUser;
// Get own profile (self only)
const getProfile = async (req, res) => {
    await userService.getProfile(req, res);
};
exports.getProfile = getProfile;
// Update own profile (self only)
const updateProfile = async (req, res) => {
    await userService.updateProfile(req, res);
};
exports.updateProfile = updateProfile;
