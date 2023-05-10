const inquirer = require("inquirer");
const mysql = require("mysql2");
const sequelize = require('./config/connection')
const express = require('express');


const app = express();
const PORT = process.env.PORT || 3001;


const connection = mysql.createConnection({
    host: "localhost",
    database: "employee_db",
});

sequelize.sync({ force: true }).then(() => {
    app.listen(PORT, () => console.log('Now listening'));
  });
  