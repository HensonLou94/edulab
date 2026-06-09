import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface CourseAttributes {
  id: number;
  name: string;
  subject: string | null;
  duration: number;
  price: number;
}

interface CourseCreationAttributes extends Optional<CourseAttributes, 'id'> {}

class Course extends Model<CourseAttributes, CourseCreationAttributes> {
  declare id: number;
  declare name: string;
  declare subject: string | null;
  declare duration: number;
  declare price: number;
}

Course.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    comment: '课时数'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  sequelize,
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Course;
