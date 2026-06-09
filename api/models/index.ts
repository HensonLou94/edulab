import sequelize from '../config/database.js';
import User from './User.js';
import Teacher from './Teacher.js';
import Student from './Student.js';
import Course from './Course.js';
import Classroom from './Classroom.js';
import Schedule from './Schedule.js';
import Signin from './Signin.js';
import Salary from './Salary.js';
import SystemLog from './SystemLog.js';
import SalaryRule from './SalaryRule.js';
import StudentSchedule from './StudentSchedule.js';

export {
  sequelize,
  User,
  Teacher,
  Student,
  Course,
  Classroom,
  Schedule,
  Signin,
  Salary,
  SystemLog,
  SalaryRule,
  StudentSchedule
};

export const setupAssociations = () => {
  User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacher' });
  Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Teacher.hasMany(Schedule, { foreignKey: 'teacherId', as: 'schedules' });
  Schedule.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

  Course.hasMany(Schedule, { foreignKey: 'courseId', as: 'schedules' });
  Schedule.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

  Classroom.hasMany(Schedule, { foreignKey: 'classroomId', as: 'schedules' });
  Schedule.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'classroom' });

  Student.hasMany(Signin, { foreignKey: 'studentId', as: 'signins' });
  Signin.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

  Schedule.hasMany(Signin, { foreignKey: 'scheduleId', as: 'signins' });
  Signin.belongsTo(Schedule, { foreignKey: 'scheduleId', as: 'schedule' });

  Teacher.hasMany(Salary, { foreignKey: 'teacherId', as: 'salarys' });
  Salary.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

  User.hasMany(SystemLog, { foreignKey: 'userId', as: 'logs' });
  SystemLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Student.belongsToMany(Schedule, {
    through: StudentSchedule,
    foreignKey: 'studentId',
    otherKey: 'scheduleId',
    as: 'schedules'
  });
  Schedule.belongsToMany(Student, {
    through: StudentSchedule,
    foreignKey: 'scheduleId',
    otherKey: 'studentId',
    as: 'students'
  });
};

export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    setupAssociations();

    await sequelize.sync({ force });
    console.log('Database synchronized.');

    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};
