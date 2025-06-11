import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as userService from '../services/userService';

// Create user (only admin)
export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await userService.createUser(req, res);
};

// Get user by id (admin or self)
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await userService.getUserById(req, res);
};

// Update user (admin or self)
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await userService.updateUser(req, res);
};

// Delete user (admin or self)
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await userService.deleteUser(req, res);
};

// Get own profile (self only)
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await userService.getProfile(req, res);
};

// Update own profile (self only)
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await userService.updateProfile(req, res);
};
