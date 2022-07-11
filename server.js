//dependencies
const inquirer = require('inquirer');
const mysql2 = require('mysql2');
require('dotenv').config();

//classes
class Department {
    constructor ( { id, name, employees = [], roles = [] } ) {
        this.id = id;
        this.name = name;
        this.employees = employees;
        this.roles = roles;
    }
}

class Role {
    constructor( { id, title, salary, department, department_id, employees = [] } ) {
        this.id = id;
        this.title = title;
        this.salary = salary;
        this.department = department;
        this.department_id = department_id;
        this.employees = employees;
    }
}

class Employee {
    constructor( { id, first_name, last_name, role, role_id, department } ) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.role = role;
        this.role_id = role_id;
        this.department = department;
    }
}

//SQL
const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'michael',
    password: process.env.DB_PASSWORD,
    database: 'employeeTrackerDB'
});
//instead of making a connections each time, i've made a promise that i call from the functions
const sql_query = (command) => new Promise((resolve, reject) => {
    connection.query(command, (err, res, fld)=>{
        if(err) return reject(err);
        else if(res) return resolve(res);  
    })
})

//adding name to the department
function createNewDepartment() {
    inquirer.prompt( {
        type: 'input',
        name: 'deptName',
        message: 'What is the department name?'
    } ).then( (answer) => {
        console.log('Creating department...');
        currentDepartment.name = answer.deptName;
        sql_query(`INSERT INTO department (name) VALUES ('${answer.deptName}');`)
        .then(response => currentDepartment.id = response.insertId);
        console.log(currentDepartment);
        console.log('Creating unique positions...')
        createNewRole();
    })
}

//adding all the details for each role
function createNewRole() {
    //pulling deptments from sql so you can select from all departments
    var depts = []
    sql_query('SELECT name FROM department;')
    .then(response => response.forEach(element => depts.push(element)))
    var role = new Role({})
    inquirer.prompt({
        type: 'input',
        name: 'title',
        message: 'what is the position title?'
    }).then((answer) =>{
        role.title = answer.title;
        inquirer.prompt({
            type: 'checkbox',
            name: 'salary',
            message: 'what is the salary range for this position?',
            choices: ['-$24,999','$25,000-$49,999','$50,000-$74,999','$75,000-$99,000','$100,000-$124,999','$125,000-$149,999', '$150,000+']
        }).then((answer) =>{
            role.salary = answer.salary;
            inquirer.prompt({
                type: 'checkbox',
                name: 'dept',
                message: 'what department is this role in?',
                choices: depts
            }).then(async answer => {
                role.department = answer.dept[0]
                await sql_query(`INSERT INTO roles (title, salary, department, department_id) VALUES ('${role.title}', '${role.salary}','${role.department}', '${currentDepartment.id}');`)
                .then(response => role.id = response.insertId);
                currentDepartment.roles.push(role);
                //looping back to create second role
                inquirer.prompt({
                    type: 'list',
                    name: 'loop',
                    message: 'Do you want to create another position?',
                    choices: ['yes','no']
                }).then((answer) =>{
                    if(answer.loop == 'yes')  createNewRole();
                    else createNewEmployee()
                })
            });
        })
    })
}


function createNewEmployee() {
    //pulling departments and roles from sql so you can select from all
    var depts = []
    var roles = []
    sql_query('SELECT name FROM department;')
    .then(response => response.forEach(element => depts.push(element)))
    sql_query('SELECT title FROM roles;')
    .then(response => response.forEach(element => roles.push(element.title)))
    console.log('Creating new employees...')
    var employee = new Employee({})
    inquirer.prompt({
        type: 'input',
        name: 'employeename',
        message: 'What is the employees name?'
    }).then((answer) => {
        employee.first_name = answer.employeename.split(' ')[0];
        employee.last_name = answer.employeename.split(' ')[1];
        inquirer.prompt({
            type: 'checkbox',
            name: 'role',
            message: 'What is the employees position?',
            choices: roles
        }).then(async (answer) => {
            employee.role = answer.role;
            //async as was having issues with undefined data being entered into sql
            await inquirer.prompt({
                type: 'checkbox',
                name: 'dept',
                message: 'what department is this employee in?',
                choices: depts
            }).then(answer => {
                employee.department = answer.dept;
            })
            await sql_query(`SELECT id from roles where title = "${employee.role}";`)
            .then(response => employee.role_id = response[0].id)
            await sql_query(`INSERT INTO employee (first_name, last_name, role_title, department, roles_id) values ('${employee.first_name}','${employee.last_name}', '${employee.role}', '${employee.department}', ${employee.role_id});`)
            .then(response => employee.id = response.insertId)
            currentDepartment.employees.push(employee);
            //call loop
            inquirer.prompt({
                type: 'list',
                name: 'loop',
                message: 'Do you want to create another employee?',
                choices: ['yes','no']
            }).then((answer) =>{
                if(answer.loop == 'yes')  createNewEmployee();
                else menu()
            })
        })
    })
    
}

//main function that starts the questions
function menu() {
    inquirer.prompt({
        type: 'list',
        name: 'initialPrompt',
        message: 'Welcome to Employee Tracker',
        choices: ['View all departments','View all roles','View all employees', 'Add a department', 'Add a Role', 'Add a employee']
    }).then(async (answer) => {
        console.log(answer.initialPrompt);
        switch (answer.initialPrompt){
            //to go through the creation functions
            case 'Add a department':
                createNewDepartment();
                break;
            case 'Add a role':
                createNewRole()
                break;
            case 'Add a employee':
                createNewEmployee()
                break;
            //to go through the viewing sections that loop back when done
            case 'View all departments':
                await sql_query('SELECT * FROM department;')
                .then(response => console.table(response))
                menu();
                break;
            case 'View all roles':
                await sql_query('SELECT * FROM roles;')
                .then(response => console.table(response))
                menu();
                break;
            case 'View all employees':
                await sql_query('SELECT * FROM employee;')
                .then(response => console.table(response))
                menu();
                break;
        }
    })
}
// calling to start
const PORT = process.env.PORT || 3001;
connection.connect((err) => {
    console.log(err);
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\non port: ${PORT}`);
    menu();
});
// creating a global variable of department
var currentDepartment = new Department({});