import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface SigninAttributes {
  id: number;
  studentId: number;
  scheduleId: number;
  signDate: Date;
  status: 'signed' | 'absent';
}

interface SigninCreationAttributes extends Optional<SigninAttributes, 'id'> {}

class Signin extends Model<SigninAttributes, SigninCreationAttributes> {
  declare id: number;
  declare studentId: number;
  declare scheduleId: number;
  declare signDate: Date;
  declare status: 'signed' | 'absent';
}

Signin.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  scheduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'schedules',
      key: 'id'
    }
  },
  signDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('signed', 'absent'),
    defaultValue: 'signed'
  }
}, {
  sequelize,
  tableName: 'signins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Signin;
