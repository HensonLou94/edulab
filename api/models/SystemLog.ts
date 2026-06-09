import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface SystemLogAttributes {
  id: number;
  userId: number | null;
  action: string;
  detail: string | null;
  ip: string | null;
}

interface SystemLogCreationAttributes extends Optional<SystemLogAttributes, 'id'> {}

class SystemLog extends Model<SystemLogAttributes, SystemLogCreationAttributes> {
  declare id: number;
  declare userId: number | null;
  declare action: string;
  declare detail: string | null;
  declare ip: string | null;
}

SystemLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'system_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SystemLog;
