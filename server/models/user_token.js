
module.exports = (sequelize, DataTypes) => {

  const UserTokens = sequelize.define(DEFINED.tableNames.tbl_user_token, {
    uid: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      references: {
        model: DEFINED.tableNames.tbl_user,
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      allowNull: false
    },
    refresh_token: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      allowNull: false
    },
    last_login_ip: {
      type: DataTypes.STRING(20),
      defaultValue: '',
      allowNull: false
    },
    reg_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get: function() {
        return moment(this.getDataValue('reg_date')).format('YYYY-MM-DD HH:mm:ss')
      }
    },
  });
  UserTokens.associate = function (models) {
    //Next
	};
  
  return UserTokens;
}