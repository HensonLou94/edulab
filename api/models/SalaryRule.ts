import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface SalaryRuleAttributes {
  id: number;
  ruleName: string | null;
  ruleType: 'base' | 'hourly' | 'bonus' | 'deduction';
  ruleValue: number;
  isActive: number;
}

interface SalaryRuleCreationAttributes extends Optional<SalaryRuleAttributes, 'id'> {}

class SalaryRule extends Model<SalaryRuleAttributes, SalaryRuleCreationAttributes> {
  declare id: number;
  declare ruleName: string | null;
  declare ruleType: 'base' | 'hourly' | 'bonus' | 'deduction';
  declare ruleValue: number;
  declare isActive: number;
}

SalaryRule.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ruleName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ruleType: {
    type: DataTypes.ENUM('base', 'hourly', 'bonus', 'deduction'),
    allowNull: false
  },
  ruleValue: {
    type: DataTypes.DECIMAL(10, 2)
  },
  isActive: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  sequelize,
  tableName: 'salary_rules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SalaryRule;
