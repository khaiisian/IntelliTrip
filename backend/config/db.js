const {Sequelize} = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(
    env.db.name,
    env.db.user,
    env.db.password,
    {
        host: env.db.host,
        dialect: env.db.dialect
    }
);

module.exports = sequelize;