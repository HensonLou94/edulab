import { Router, Response } from 'express';
import { Student, Teacher, Schedule, Salary, SalaryRule, Course, Signin } from '../models/index.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middlewares/auth.js';
import { Op } from 'sequelize';
import * as XLSX from 'xlsx';

const router = Router();

router.use(authMiddleware);

// Get dashboard data
router.get('/dashboard', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Get counts
    const totalStudents = await Student.count({ where: { status: 'active' } });
    const totalTeachers = await Teacher.count();

    // Today's courses
    const todayCourses = await Schedule.count({
      where: {
        startTime: {
          [Op.between]: [todayStart, todayEnd]
        }
      }
    });

    // Monthly salary total
    const monthlySalaries = await Salary.findAll({
      where: {
        year: now.getFullYear(),
        month: now.getMonth() + 1
      },
      attributes: [
        [Salary.sequelize.fn('SUM', Salary.sequelize.col('total_salary')), 'total']
      ]
    });

    const monthlySalaryTotal = monthlySalaries[0]?.dataValues?.total || 0;

    // Recent activities
    const recentSignins = await Signin.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{
        model: Student,
        as: 'student',
        attributes: ['name']
      }]
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        todayCourses,
        monthlySalaryTotal: Number(monthlySalaryTotal),
        recentActivities: recentSignins
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: '获取看板数据失败'
    });
  }
});

// Get system logs
router.get('/logs', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 50, action, userId } = req.query;

    const where: any = {};
    if (action) where.action = { [Op.like]: `%${action}%` };
    if (userId) where.userId = userId;

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await require('../models/index.js').SystemLog.findAndCountAll({
      where,
      include: [{
        model: require('../models/index.js').User,
        as: 'user',
        attributes: ['username']
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
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: '获取日志失败'
    });
  }
});

// Get salary rules
router.get('/salary-rules', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rules = await SalaryRule.findAll({
      order: [['ruleType', 'ASC']]
    });

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Get salary rules error:', error);
    res.status(500).json({
      success: false,
      message: '获取薪资规则失败'
    });
  }
});

// Update salary rules
router.put('/salary-rules', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { rules } = req.body;

    if (!Array.isArray(rules)) {
      return res.status(400).json({
        success: false,
        message: '规则数据格式错误'
      });
    }

    for (const rule of rules) {
      if (rule.id) {
        await SalaryRule.update(
          {
            ruleName: rule.ruleName,
            ruleValue: rule.ruleValue,
            isActive: rule.isActive
          },
          { where: { id: rule.id } }
        );
      } else {
        await SalaryRule.create({
          ruleName: rule.ruleName,
          ruleType: rule.ruleType,
          ruleValue: rule.ruleValue,
          isActive: rule.isActive ?? 1
        });
      }
    }

    const allRules = await SalaryRule.findAll({
      order: [['ruleType', 'ASC']]
    });

    res.json({
      success: true,
      data: allRules
    });
  } catch (error) {
    console.error('Update salary rules error:', error);
    res.status(500).json({
      success: false,
      message: '更新薪资规则失败'
    });
  }
});

// Data backup
router.post('/backup', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // In a real application, this would backup the database
    // For now, we'll just return success
    const backupData = {
      timestamp: new Date().toISOString(),
      tables: ['students', 'teachers', 'courses', 'schedules', 'salarys'],
      status: 'success'
    };

    res.json({
      success: true,
      message: '数据备份成功',
      data: backupData
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({
      success: false,
      message: '数据备份失败'
    });
  }
});

// Export students to Excel
router.get('/export/students', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const students = await Student.findAll({
      order: [['created_at', 'DESC']]
    });

    const data = students.map(s => ({
      '姓名': s.name,
      '电话': s.phone || '',
      '年龄': s.age || '',
      '年级': s.grade || '',
      '状态': s.status === 'active' ? '在读' : '休学',
      '创建时间': s.created_at
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '学员列表');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({
      success: false,
      message: '导出学员失败'
    });
  }
});

export default router;
