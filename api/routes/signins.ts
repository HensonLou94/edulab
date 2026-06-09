import { Router } from 'express';
import type { Response } from 'express';
import { Signin, Schedule, Student } from '../models/index.js';
import { authMiddleware } from '../middlewares/auth.js';
import type { AuthRequest } from '../types.js';

const router = Router();

router.use(authMiddleware);

// Create sign-in
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, scheduleId, signDate, status } = req.body;

    if (!studentId || !scheduleId || !signDate) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // Check if already signed in
    const existingSignin = await Signin.findOne({
      where: {
        studentId,
        scheduleId,
        signDate: new Date(signDate)
      }
    });

    if (existingSignin) {
      // Update existing sign-in
      await existingSignin.update({
        status: status || existingSignin.status
      });

      return res.json({
        success: true,
        data: existingSignin
      });
    }

    const signin = await Signin.create({
      studentId,
      scheduleId,
      signDate: new Date(signDate),
      status: status || 'signed'
    });

    res.json({
      success: true,
      data: signin
    });
  } catch (error) {
    console.error('Create sign-in error:', error);
    res.status(500).json({
      success: false,
      message: '创建签到记录失败'
    });
  }
});

// Get sign-ins by schedule
router.get('/schedule/:scheduleId', async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    const where: any = { scheduleId: req.params.scheduleId };
    if (date) {
      where.signDate = new Date(date);
    }

    const signins = await Signin.findAll({
      where,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'phone', 'grade']
      }],
      order: [['sign_date', 'DESC']]
    });

    res.json({
      success: true,
      data: signins
    });
  } catch (error) {
    console.error('Get sign-ins error:', error);
    res.status(500).json({
      success: false,
      message: '获取签到记录失败'
    });
  }
});

// Batch sign-in for a schedule
router.post('/batch', async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId, signDate, records } = req.body;

    if (!scheduleId || !signDate || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const results = [];
    for (const record of records) {
      const { studentId, status } = record;

      const [signin, created] = await Signin.findOrCreate({
        where: {
          studentId,
          scheduleId,
          signDate: new Date(signDate)
        },
        defaults: {
          status: status || 'signed'
        }
      });

      if (!created) {
        await signin.update({ status: status || signin.status });
      }

      results.push(signin);
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch sign-in error:', error);
    res.status(500).json({
      success: false,
      message: '批量签到失败'
    });
  }
});

export default router;
