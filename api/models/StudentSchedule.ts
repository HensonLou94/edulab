import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Student from './Student.js';
import Schedule from './Schedule.js';

interface StudentScheduleAttributes {
  studentId: number;
  scheduleId: number;
}

class StudentSchedule extends Model<StudentScheduleAttributes, StudentScheduleAttributes> {
  declare studentId: number;
  declare scheduleId: number;
}

StudentSchedule.init({
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Student,
      key: 'id'
    }
  },
  scheduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Schedule,
      key: 'id'
    }
  }
}, {
  sequelize,
  tableName: 'student_schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default StudentSchedule;
