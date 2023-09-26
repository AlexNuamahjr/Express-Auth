const dbConnect = require('./dbConnect');
const {Sequelize, DataTypes} = require('sequelize');

const User = dbConnect.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
})
User.sync()
module.exports = User;