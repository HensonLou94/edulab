import type { Response, NextFunction } from 'express';
import { authMiddleware } from './auth.js';
import { SystemLog } from '../models/index.js';
import type { AuthRequest } from '../types.js';

export const logMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    // Log the action
    if (req.user && req.method !== 'GET') {
      SystemLog.create({
        userId: req.user.id,
        action: `${req.method} ${req.path}`,
        detail: JSON.stringify(data),
        ip: req.ip || ''
      }).catch(console.error);
    }

    return originalJson(data);
  };

  next();
};
