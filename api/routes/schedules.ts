import { Router, Response } from 'express';
import { Op } from 'sequelize';
import { Schedule, Course, Teacher, Classroom, Student, StudentSchedule } from '../models/index.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

// Get all schedules
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, courseId, teacherId, classroomId, startDate, endDate } = req.query;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (teacherId) where.teacherId = teacherId;
    if (classroomId) where.classroomId = classroomId;
    if (startDate && endDate) {
      where.startTime = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Schedule.findAndCountAll({
      where,
      include: [
        { model: Course, as: 'course' },
        { model: Teacher, as: 'teacher' },
        { model: Classroom, as: 'classroom' }
      ],
      limit: Number(pageSize),
      offset,
      order: [['startTime', 'ASC']]
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
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: '获取排课列表失败'
    });
  }
});

// Get schedule by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id, {
      include: [
        { model: Course, as: 'course' },
        { model: Teacher, as: 'teacher' },
        { model: Classroom, as: 'classroom' },
        {
          model: Student,
          as: 'students',
          through: { attributes: [] }
        }
      ]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '排课不存在'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: '获取排课信息失败'
    });
  }
});

// Get teacher schedule
router.get('/teacher/:teacherId', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { teacherId: req.params.teacherId };
    if (startDate && endDate) {
      where.startTime = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const schedules = await Schedule.findAll({
      where,
      include: [
        { model: Course, as: 'course' },
        { model: Teacher, as: 'teacher' },
        { model: Classroom, as: 'classroom' }
      ],
      order: [['startTime', 'ASC']]
    });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get teacher schedule error:', error);
    res.status(500).json({
      success: false,
      message: '获取教师课表失败'
    });
  }
});

// Get student schedule
router.get('/student/:studentId', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const studentSchedules = await StudentSchedule.findAll({
      where: { studentId: req.params.studentId },
      include: [{
        model: Schedule,
        as: 'schedule',
        where: startDate && endDate ? {
          startTime: {
            [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
          }
        } : undefined,
        include: [
          { model: Course, as: 'course' },
          { model: Teacher, as: 'teacher' },
          { model: Classroom, as: 'classroom' }
        ]
      }]
    });

    const schedules = studentSchedules.map((ss: any) => ss.schedule);

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get student schedule error:', error);
    res.status(500).json({
      success: false,
      message: '获取学员课表失败'
    });
  }
});

// Check conflict
router.post('/check-conflict', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId, teacherId, startTime, endTime, excludeScheduleId } = req.body;

    const where: any = {
      [Op.or]: [
        {
          classroomId,
          startTime: { [Op.lt]: new Date(endTime) },
          endTime: { [Op.gt]: new Date(startTime) }
        },
        {
          teacherId,
          startTime: { [Op.lt]: new Date(endTime) },
          endTime: { [Op.gt]: new Date(startTime) }
        }
      ]
    };

    if (excludeScheduleId) {
      where.id = { [Op.ne]: excludeScheduleId };
    }

    const conflicts = await Schedule.findAll({ where });

    if (conflicts.length > 0) {
      const conflictDetails = await Promise.all(conflicts.map(async (c: any) => {
        const classroom = await Classroom.findByPk(c.classroomId);
        const teacher = await Teacher.findByPk(c.teacherId);
        return {
          id: c.id,
          classroom: classroom?.name,
          teacher: teacher?.name,
          startTime: c.startTime,
          endTime: c.endTime
        };
      }));

      return res.json({
        success: true,
        data: {
          hasConflict: true,
          conflicts: conflictDetails
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasConflict: false,
        conflicts: []
      }
    });
  } catch (error) {
    console.error('Check conflict error:', error);
    res.status(500).json({
      success: false,
      message: '检测冲突失败'
    });
  }
});

// Create schedule
router.post('/', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, teacherId, classroomId, startTime, endTime, weekType, studentIds } = req.body;

    if (!courseId || !teacherId || !classroomId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // Check for conflicts
    const conflicts = await Schedule.findAll({
      where: {
        [Op.or]: [
          {
            classroomId,
            startTime: { [Op.lt]: new Date(endTime) },
            endTime: { [Op.gt]: new Date(startTime) }
          },
          {
            teacherId,
            startTime: { [Op.lt]: new Date(endTime) },
            endTime: { [Op.gt]: new Date(startTime) }
          }
        ]
      }
    });

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: '排课时间与现有课程冲突',
        data: { conflicts }
      });
    }

    const schedule = await Schedule.create({
      courseId,
      teacherId,
      classroomId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      weekType: weekType || 'all'
    });

    // Assign students to schedule
    if (studentIds && Array.isArray(studentIds)) {
      const studentScheduleData = studentIds.map((studentId: number) => ({
        studentId,
        scheduleId: schedule.id
      }));
      await StudentSchedule.bulkCreate(studentScheduleData);
    }

    const scheduleWithDetails = await Schedule.findByPk(schedule.id, {
      include: [
        { model: Course, as: 'course' },
        { model: Teacher, as: 'teacher' },
        { model: Classroom, as: 'classroom' }
      ]
    });

    res.json({
      success: true,
      data: scheduleWithDetails
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: '创建排课失败'
    });
  }
});

// Update schedule
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '排课不存在'
      });
    }

    const { courseId, teacherId, classroomId, startTime, endTime, weekType, studentIds } = req.body;

    // Check for conflicts if time or resources changed
    if (classroomId || teacherId || startTime || endTime) {
      const conflicts = await Schedule.findAll({
        where: {
          id: { [Op.ne]: schedule.id },
          [Op.or]: [
            {
              classroomId: classroomId || schedule.classroomId,
              startTime: { [Op.lt]: new Date(endTime || schedule.endTime) },
              endTime: { [Op.gt]: new Date(startTime || schedule.startTime) }
            },
            {
              teacherId: teacherId || schedule.teacherId,
              startTime: { [Op.lt]: new Date(endTime || schedule.endTime) },
              endTime: { [Op.gt]: new Date(startTime || schedule.startTime) }
            }
          ]
        }
      });

      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: '排课时间与现有课程冲突'
        });
      }
    }

    await schedule.update({
      courseId: courseId !== undefined ? courseId : schedule.courseId,
      teacherId: teacherId !== undefined ? teacherId : schedule.teacherId,
      classroomId: classroomId !== undefined ? classroomId : schedule.classroomId,
      startTime: startTime ? new Date(startTime) : schedule.startTime,
      endTime: endTime ? new Date(endTime) : schedule.endTime,
      weekType: weekType !== undefined ? weekType : schedule.weekType
    });

    // Update students if provided
    if (studentIds && Array.isArray(studentIds)) {
      await StudentSchedule.destroy({ where: { scheduleId: schedule.id } });
      const studentScheduleData = studentIds.map((studentId: number) => ({
        studentId,
        scheduleId: schedule.id
      }));
      await StudentSchedule.bulkCreate(studentScheduleData);
    }

    const updatedSchedule = await Schedule.findByPk(schedule.id, {
      include: [
        { model: Course, as: 'course' },
        { model: Teacher, as: 'teacher' },
        { model: Classroom, as: 'classroom' },
        { model: Student, as: 'students', through: { attributes: [] } }
      ]
    });

    res.json({
      success: true,
      data: updatedSchedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: '更新排课失败'
    });
  }
});

// Delete schedule
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '排课不存在'
      });
    }

    await StudentSchedule.destroy({ where: { scheduleId: schedule.id } });
    await schedule.destroy();

    res.json({
      success: true,
      message: '删除排课成功'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: '删除排课失败'
    });
  }
});

export default router;
