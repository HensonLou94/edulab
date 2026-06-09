import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Teacher } from '../models/index.js';
import { generateToken, authMiddleware, AuthRequest } from '../middlewares/auth.js';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const token = generateToken(user);

    let teacherId: number | undefined;
    let teacherName: string | undefined;
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: user.id } });
      if (teacher) {
        teacherId = teacher.id;
        teacherName = teacher.name;
      }
    } else {
      const teacher = await Teacher.findOne({ where: { userId: user.id } });
      if (teacher) {
        teacherName = teacher.name;
      }
    }

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          teacherId,
          teacherName
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user?.id, {
      attributes: ['id', 'username', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    let teacherData = null;
    if (user.role === 'teacher') {
      teacherData = await Teacher.findOne({ where: { userId: user.id } });
    }

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        teacher: teacherData
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

router.put('/password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '旧密码和新密码不能为空'
      });
    }

    const user = await User.findByPk(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '旧密码错误'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: '密码修改失败'
    });
  }
});

export default router;
