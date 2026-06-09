import { Router } from 'express';
import type { Response } from 'express';
import { Course } from '../models/index.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';
import type { AuthRequest } from '../types.js';

const router = Router();

router.use(authMiddleware);

// Get all courses
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, name, subject } = req.query;

    const where: any = {};
    if (name) where.name = { $like: `%${name}%` };
    if (subject) where.subject = { $like: `%${subject}%` };

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Course.findAndCountAll({
      where,
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
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
});

// Get course by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: '获取课程信息失败'
    });
  }
});

// Create course
router.post('/', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, subject, duration, price } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '课程名称不能为空'
      });
    }

    const course = await Course.create({
      name,
      subject,
      duration: duration || 0,
      price: price || 0
    });

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: '创建课程失败'
    });
  }
});

// Update course
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    const { name, subject, duration, price } = req.body;

    await course.update({
      name: name || course.name,
      subject: subject !== undefined ? subject : course.subject,
      duration: duration !== undefined ? duration : course.duration,
      price: price !== undefined ? price : course.price
    });

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: '更新课程失败'
    });
  }
});

// Delete course
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    await course.destroy();

    res.json({
      success: true,
      message: '删除课程成功'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: '删除课程失败'
    });
  }
});

export default router;
