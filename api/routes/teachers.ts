import { Router } from 'express';
import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Teacher, User, Schedule, Signin } from '../models/index.js';
import { authMiddleware, adminMiddleware, teacherSelfMiddleware } from '../middlewares/auth.js';
import type { AuthRequest } from '../types.js';

const router = Router();

router.use(authMiddleware);

// Get all teachers
router.get('/', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, name, subjects } = req.query;

    const where: any = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (subjects) where.subjects = { [Op.like]: `%${subjects}%` };

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Teacher.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'role']
      }],
      limit: Number(pageSize),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: '获取教师列表失败'
    });
  }
});

// Get teacher by ID
router.get('/:id', teacherSelfMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'role']
      }]
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师不存在'
      });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      success: false,
      message: '获取教师信息失败'
    });
  }
});

// Get teacher stats
router.get('/:id/stats', teacherSelfMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师不存在'
      });
    }

    // Get total teaching hours this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const schedules = await Schedule.findAll({
      where: {
        teacherId: teacher.id,
        startTime: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    let totalHours = 0;
    schedules.forEach((s: any) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    });

    const totalCourses = await Schedule.count({
      where: { teacherId: teacher.id }
    });

    res.json({
      success: true,
      data: {
        teacherId: teacher.id,
        teacherName: teacher.name,
        totalHoursThisMonth: Math.round(totalHours * 100) / 100,
        totalCourses,
        baseSalary: teacher.baseSalary,
        hourlyRate: teacher.hourlyRate
      }
    });
  } catch (error) {
    console.error('Get teacher stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取教师统计失败'
    });
  }
});

// Create teacher
router.post('/', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, name, phone, subjects, baseSalary, hourlyRate } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '教师姓名不能为空'
      });
    }

    // Create user account if username provided
    let userId: number | null = null;
    if (username && password) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        password: hashedPassword,
        role: 'teacher'
      });
      userId = user.id;
    }

    const teacher = await Teacher.create({
      userId,
      name,
      phone,
      subjects,
      baseSalary: baseSalary || 0,
      hourlyRate: hourlyRate || 0
    });

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({
      success: false,
      message: '创建教师失败'
    });
  }
});

// Update teacher
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师不存在'
      });
    }

    const { name, phone, subjects, baseSalary, hourlyRate } = req.body;

    await teacher.update({
      name: name || teacher.name,
      phone: phone !== undefined ? phone : teacher.phone,
      subjects: subjects !== undefined ? subjects : teacher.subjects,
      baseSalary: baseSalary !== undefined ? baseSalary : teacher.baseSalary,
      hourlyRate: hourlyRate !== undefined ? hourlyRate : teacher.hourlyRate
    });

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({
      success: false,
      message: '更新教师失败'
    });
  }
});

// Delete teacher
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师不存在'
      });
    }

    // Delete associated user if exists
    if (teacher.userId) {
      await User.destroy({ where: { id: teacher.userId } });
    }

    await teacher.destroy();

    res.json({
      success: true,
      message: '删除教师成功'
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({
      success: false,
      message: '删除教师失败'
    });
  }
});

export default router;
