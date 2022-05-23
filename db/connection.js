const express = require('express');
const { builtinModules } = require('module');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employees_db'
    },
    console.log(`connected to the employees_db database.`)
);

db.connect(function (err) {
    if (err) throw err;
  });  

module.exports = db