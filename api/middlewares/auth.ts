import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Teacher } from '../models/index.js';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'admin' | 'teacher';
    teacherId?: number;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'edulab-secret-key-2024';

export const generateToken = (user: { id: number; username: string; role: string }): string => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    let teacherId: number | undefined;
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: user.id } });
      if (teacher) {
        teacherId = teacher.id;
      }
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      teacherId
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token无效或已过期'
    });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

export const teacherSelfMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  const teacherId = parseInt(req.params.teacherId || req.params.id || '0');
  if (req.user?.teacherId !== teacherId) {
    return res.status(403).json({
      success: false,
      message: '只能访问自己的数据'
    });
  }
  next();
};
