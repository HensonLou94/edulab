import { Router } from 'express';
import type { Response } from 'express';
import { Op } from 'sequelize';
import * as XLSX from 'xlsx';
import { Salary, Teacher, Schedule, User } from '../models/index.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';
import type { AuthRequest } from '../types.js';

const router = Router();

router.use(authMiddleware);

// Get all salaries
router.get('/', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, year, month, teacherId, status } = req.query;

    const where: any = {};
    if (year) where.year = year;
    if (month) where.month = month;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Salary.findAndCountAll({
      where,
      include: [{
        model: Teacher,
        as: 'teacher',
        attributes: ['id', 'name', 'phone']
      }],
      limit: Number(pageSize),
      offset,
      order: [['year', 'DESC'], ['month', 'DESC']]
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
    console.error('Get salaries error:', error);
    res.status(500).json({
      success: false,
      message: '获取薪资列表失败'
    });
  }
});

// Get salary by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const salary = await Salary.findByPk(req.params.id, {
      include: [{
        model: Teacher,
        as: 'teacher'
      }]
    });

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: '薪资记录不存在'
      });
    }

    // Check permission
    if (req.user?.role === 'teacher' && salary.teacher?.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只能查看自己的薪资'
      });
    }

    res.json({
      success: true,
      data: salary
    });
  } catch (error) {
    console.error('Get salary error:', error);
    res.status(500).json({
      success: false,
      message: '获取薪资信息失败'
    });
  }
});

// Calculate salary
router.post('/calculate', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { year, month, teacherIds } = req.body;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: '年份和月份不能为空'
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get teachers to calculate
    const teachers = teacherIds
      ? await Teacher.findAll({ where: { id: { [Op.in]: teacherIds } } })
      : await Teacher.findAll();

    const results = [];

    for (const teacher of teachers) {
      // Check if salary already exists
      const existingSalary = await Salary.findOne({
        where: { teacherId: teacher.id, year, month }
      });

      if (existingSalary) {
        results.push(existingSalary);
        continue;
      }

      // Calculate teaching hours
      const schedules = await Schedule.findAll({
        where: {
          teacherId: teacher.id,
          startTime: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      let totalHours = 0;
      schedules.forEach((s: any) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      });

      const teachingFee = totalHours * Number(teacher.hourlyRate);
      const totalSalary = Number(teacher.baseSalary) + teachingFee;

      const salary = await Salary.create({
        teacherId: teacher.id,
        year,
        month,
        baseSalary: teacher.baseSalary,
        teachingHours: totalHours,
        teachingFee,
        totalSalary,
        status: 'pending'
      });

      results.push(salary);
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Calculate salary error:', error);
    res.status(500).json({
      success: false,
      message: '核算薪资失败'
    });
  }
});

// Update salary status
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const salary = await Salary.findByPk(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: '薪资记录不存在'
      });
    }

    const { status } = req.body;

    await salary.update({
      status: status || salary.status
    });

    res.json({
      success: true,
      data: salary
    });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({
      success: false,
      message: '更新薪资失败'
    });
  }
});

// Export salaries to Excel
router.get('/export', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query;

    const where: any = {};
    if (year) where.year = Number(year);
    if (month) where.month = Number(month);

    const salaries = await Salary.findAll({
      where,
      include: [{
        model: Teacher,
        as: 'teacher'
      }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    const data = salaries.map((s: any) => ({
      '年份': s.year,
      '月份': s.month,
      '教师姓名': s.teacher?.name || '',
      '联系电话': s.teacher?.phone || '',
      '底薪': Number(s.baseSalary),
      '授课课时': Number(s.teachingHours),
      '课时费': Number(s.teachingFee),
      '应发工资': Number(s.totalSalary),
      '状态': s.status === 'paid' ? '已发放' : '待发放'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '薪资表');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=salary_${year || 'all'}_${month || 'all'}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Export salary error:', error);
    res.status(500).json({
      success: false,
      message: '导出薪资失败'
    });
  }
});

export default router;
