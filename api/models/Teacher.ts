import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface TeacherAttributes {
  id: number;
  userId: number | null;
  name: string;
  phone: string | null;
  subjects: string | null;
  baseSalary: number;
  hourlyRate: number;
}

interface TeacherCreationAttributes extends Optional<TeacherAttributes, 'id'> {}

class Teacher extends Model<TeacherAttributes, TeacherCreationAttributes> {
  declare id: number;
  declare userId: number | null;
  declare name: string;
  declare phone: string | null;
  declare subjects: string | null;
  declare baseSalary: number;
  declare hourlyRate: number;
}

Teacher.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  subjects: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  baseSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'teachers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Teacher;
