import { Router, Response } from 'express';
import { Classroom } from '../models/index.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

// Get all classrooms
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, name } = req.query;

    const where: any = {};
    if (name) where.name = { $like: `%${name}%` };

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Classroom.findAndCountAll({
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
    console.error('Get classrooms error:', error);
    res.status(500).json({
      success: false,
      message: '获取教室列表失败'
    });
  }
});

// Get classroom by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const classroom = await Classroom.findByPk(req.params.id);

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: '教室不存在'
      });
    }

    res.json({
      success: true,
      data: classroom
    });
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({
      success: false,
      message: '获取教室信息失败'
    });
  }
});

// Create classroom
router.post('/', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, capacity } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '教室名称不能为空'
      });
    }

    const classroom = await Classroom.create({
      name,
      capacity: capacity || 30
    });

    res.json({
      success: true,
      data: classroom
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({
      success: false,
      message: '创建教室失败'
    });
  }
});

// Update classroom
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const classroom = await Classroom.findByPk(req.params.id);

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: '教室不存在'
      });
    }

    const { name, capacity } = req.body;

    await classroom.update({
      name: name || classroom.name,
      capacity: capacity !== undefined ? capacity : classroom.capacity
    });

    res.json({
      success: true,
      data: classroom
    });
  } catch (error) {
    console.error('Update classroom error:', error);
    res.status(500).json({
      success: false,
      message: '更新教室失败'
    });
  }
});

// Delete classroom
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const classroom = await Classroom.findByPk(req.params.id);

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: '教室不存在'
      });
    }

    await classroom.destroy();

    res.json({
      success: true,
      message: '删除教室成功'
    });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({
      success: false,
      message: '删除教室失败'
    });
  }
});

export default router;
