import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Course from './Course.js';
import Teacher from './Teacher.js';
import Classroom from './Classroom.js';

interface ScheduleAttributes {
  id: number;
  courseId: number;
  teacherId: number;
  classroomId: number;
  startTime: Date;
  endTime: Date;
  weekType: 'single' | 'all' | 'half_month' | 'month';
}

interface ScheduleCreationAttributes extends Optional<ScheduleAttributes, 'id'> {}

class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> {
  declare id: number;
  declare courseId: number;
  declare teacherId: number;
  declare classroomId: number;
  declare startTime: Date;
  declare endTime: Date;
  declare weekType: 'single' | 'all' | 'half_month' | 'month';
}

Schedule.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Course,
      key: 'id'
    }
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'id'
    }
  },
  classroomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Classroom,
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  weekType: {
    type: DataTypes.ENUM('single', 'all', 'half_month', 'month'),
    defaultValue: 'all'
  }
}, {
  sequelize,
  tableName: 'schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Schedule;
