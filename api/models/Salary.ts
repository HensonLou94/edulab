import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface SalaryAttributes {
  id: number;
  teacherId: number;
  year: number;
  month: number;
  baseSalary: number;
  teachingHours: number;
  teachingFee: number;
  totalSalary: number;
  status: 'pending' | 'paid';
}

interface SalaryCreationAttributes extends Optional<SalaryAttributes, 'id'> {}

class Salary extends Model<SalaryAttributes, SalaryCreationAttributes> {
  declare id: number;
  declare teacherId: number;
  declare year: number;
  declare month: number;
  declare baseSalary: number;
  declare teachingHours: number;
  declare teachingFee: number;
  declare totalSalary: number;
  declare status: 'pending' | 'paid';
}

Salary.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  baseSalary: {
    type: DataTypes.DECIMAL(10, 2)
  },
  teachingHours: {
    type: DataTypes.DECIMAL(10, 2)
  },
  teachingFee: {
    type: DataTypes.DECIMAL(10, 2)
  },
  totalSalary: {
    type: DataTypes.DECIMAL(10, 2)
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid'),
    defaultValue: 'pending'
  }
}, {
  sequelize,
  tableName: 'salarys',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Salary;
