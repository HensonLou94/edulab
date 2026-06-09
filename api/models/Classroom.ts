import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface ClassroomAttributes {
  id: number;
  name: string;
  capacity: number;
}

interface ClassroomCreationAttributes extends Optional<ClassroomAttributes, 'id'> {}

class Classroom extends Model<ClassroomAttributes, ClassroomCreationAttributes> {
  declare id: number;
  declare name: string;
  declare capacity: number;
}

Classroom.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER
  }
}, {
  sequelize,
  tableName: 'classrooms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Classroom;
