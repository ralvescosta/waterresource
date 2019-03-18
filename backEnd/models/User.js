module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      required: true
    },
    email: {
      type: DataTypes.STRING,
      required: true
    },
    password: {
      type: DataTypes.STRING,
      required: true
    },
    address: {
      type: DataTypes.STRING,
      required: true
    },
    acesso: {
      type: DataTypes.INTEGER,
      required: true
    },
    aquisition: {
      type: DataTypes.INTEGER,
      required: true
    },
    cxTxt: {
      type: DataTypes.STRING,
      required: true
    },
    cxB: {
      type: DataTypes.FLOAT,
      required: true      
    },
    cxC: {
      type: DataTypes.FLOAT,
      required: true
    },
    cxE: {
      type: DataTypes.FLOAT,
      required: true
    },
    aMin: {
      type: DataTypes.FLOAT,
      required: true
    },
    aMax: {
      type: DataTypes.FLOAT,
      required: true
    },
    isPumpConfigured:{
      type: DataTypes.INTEGER,
      required: true
    },
    isPumpBlocked: {
      type: DataTypes.INTEGER,
      required: true
    },
    isPumpConcerted: {
      type: DataTypes.INTEGER,
      required: true
    }
  });

  User.associate = models => {
    User.hasMany(models.Nivel);
  };

  return User;
}