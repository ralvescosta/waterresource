const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../services/database/config/database');

const db = {};
const sequelize = new Sequelize(config);

//Models
db.User = require('../models/User')(sequelize,Sequelize);
db.Nivel = require('../models/Nivel')(sequelize,Sequelize);

//Relations
db.Nivel.belongsTo(db.User);//source
db.User.hasMany(db.Nivel);//target


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;