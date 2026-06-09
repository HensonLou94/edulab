import { Router } from 'express';
import type { Response } from 'express';
import { Student, Signin, Schedule, StudentSchedule } from '../models/index.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';
import type { AuthRequest } from '../types.js';

const router = Router();

router.use(authMiddleware);

// Get all students
router.get('/', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, name, phone, status } = req.query;

    const where: any = {};
    if (name) where.name = { $like: `%${name}%` };
    if (phone) where.phone = { $like: `%${phone}%` };
    if (status) where.status = status;

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Student.findAndCountAll({
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
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: '获取学员列表失败'
    });
  }
});

// Get student by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    // Get student's schedules
    const studentSchedules = await StudentSchedule.findAll({
      where: { studentId: student.id },
      include: [{
        model: Schedule,
        as: 'schedule',
        include: ['course', 'teacher', 'classroom']
      }]
    });

    res.json({
      success: true,
      data: {
        ...student.toJSON(),
        schedules: studentSchedules.map((ss: any) => ss.schedule)
      }
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: '获取学员信息失败'
    });
  }
});

// Create student
router.post('/', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, age, grade, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '学员姓名不能为空'
      });
    }

    const student = await Student.create({
      name,
      phone,
      age,
      grade,
      status: status || 'active'
    });

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: '创建学员失败'
    });
  }
});

// Update student
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    const { name, phone, age, grade, status } = req.body;

    await student.update({
      name: name || student.name,
      phone: phone !== undefined ? phone : student.phone,
      age: age !== undefined ? age : student.age,
      grade: grade !== undefined ? grade : student.grade,
      status: status || student.status
    });

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: '更新学员失败'
    });
  }
});

// Delete student
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    await student.destroy();

    res.json({
      success: true,
      message: '删除学员成功'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: '删除学员失败'
    });
  }
});

// Get student sign-ins
router.get('/:id/signins', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Signin.findAndCountAll({
      where: { studentId: req.params.id },
      include: [{
        model: Schedule,
        as: 'schedule',
        include: ['course', 'teacher']
      }],
      limit: Number(pageSize),
      offset,
      order: [['sign_date', 'DESC']]
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
    console.error('Get sign-ins error:', error);
    res.status(500).json({
      success: false,
      message: '获取签到记录失败'
    });
  }
});

// Assign student to schedule
router.post('/:id/schedules', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId } = req.body;
    const studentId = parseInt(req.params.id);

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学员不存在'
      });
    }

    await StudentSchedule.findOrCreate({
      where: { studentId, scheduleId }
    });

    res.json({
      success: true,
      message: '分配课程成功'
    });
  } catch (error) {
    console.error('Assign schedule error:', error);
    res.status(500).json({
      success: false,
      message: '分配课程失败'
    });
  }
});

export default router;
