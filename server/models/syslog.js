
module.exports = (sequelize, DataTypes) => {

  const SysLogs = sequelize.define(DEFINED.tableNames.tbl_syslog, {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    logcode: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    logsubcode: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    logtype: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    vid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    uid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    logdate: {
      type: DataTypes.INTEGER,
      defaultValue: DataTypes.NOW
    },
    logtimestamp: {
      type: DataTypes.INTEGER, 
      defaultValue: DataTypes.NOW
    },
  });
  SysLogs.associate = function (models) {
    //Next
	};
  
  return SysLogs;
}