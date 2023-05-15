// list of imports and port the server will run on
const inquirer = require("inquirer");
const PORT = process.env.PORT || 3001;
const mysql = require('mysql2');
require('dotenv').config();

// connects mysql to the server
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.DB_PASSWORD,
    database :'employee_db'

});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database!");
start();

});

// main menu 
function start() {
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Add a Manager",
                "Update an employee role",
                "View Employees by Manager",
                "View Employees by Department",
                "Delete Departments | Roles | Employees",
                "View the total utilized budget of a department",
                "Exit",
            ],
        })
        // handles the users input
        .then((answer) => {
            switch (answer.action) {
                case "View all departments":
                    viewAllDepartments();
                    break;
                case "View all roles":
                    viewAllRoles();
                    break;
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Add a Manager":
                    addManager();
                    break;
                case "Update an employee role":
                    updateEmployeeRole();
                    break;
                case "View Employees by Manager":
                    viewEmployeesByManager();
                    break;
                case "View Employees by Department":
                    viewEmployeesByDepartment();
                    break;
                case "Delete Departments | Roles | Employees":
                    deleteDepartmentsRolesEmployees();
                    break;
                case "View the total utilized budget of a department":
                    viewTotalUtilizedBudgetOfDepartment();
                    break;
                case "Exit":
                    connection.end();
                    console.log("Goodbye!");
                    break;
            }
        });
}


function viewAllDepartments() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // restart the application
        start();
    });
}

function viewAllRoles() {
    const query = "SELECT roles.title, roles.id, departments.departmentName, roles.salary from roles join departments on roles.departmentId = departments.id";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // restart the application
        start();
    });
}

// shows all employee from the database
function viewAllEmployees() {
    const query = `
    SELECT e.id, e.firstName, e.lastName, r.title, d.departmentName, r.salary, CONCAT(m.firstName, ' ', m.lastName) AS managerName
    FROM employee e
    LEFT JOIN roles r ON e.roleId = r.id
    LEFT JOIN departments d ON r.departmentId = d.id
    LEFT JOIN employee m ON e.managerId = m.id;
    `;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // restart the application
        start();
    });
}

//adds a department to the database
function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "Enter the name of the new department:",
        })
        .then((answer) => {
            console.log(answer.name);
            const query = `INSERT INTO departments (departmentName) VALUES ("${answer.name}")`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log(`Added department ${answer.name} to the database!`);
                // restart the application
                start();
                console.log(answer.name);
            });
        });
}

// adds role to the database
function addRole() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter the title of the new role:",
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Enter the salary of the new role:",
                },
                {
                    type: "list",
                    name: "department",
                    message: "Select the department for the new role:",
                    choices: res.map(
                        (department) => department.departmentName
                    ),
                },
            ])
            .then((answers) => {
                const department = res.find(
                    (department) => department.name === answers.department
                );
                const query = "INSERT INTO roles SET ?";
                connection.query(
                    query,
                    {
                        title: answers.title,
                        salary: answers.salary,
                        departmentId: department,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            `Added role ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database!`
                        );
                        // restart the application
                        start();
                    }
                );
            });
    });
}

function addEmployee() {
    // Retrieve list of roles from the database
    connection.query("SELECT id, title FROM roles", (error, results) => {
        if (error) {
            console.error(error);
            return;
        }

        const roles = results.map(({ id, title }) => ({
            name: title,
            value: id,
        }));

        // Retrieve list of employees from the database to use as managers
        connection.query(
            'SELECT id, CONCAT(firstName, " ", lastName) AS name FROM employee',
            (error, results) => {
                if (error) {
                    console.error(error);
                    return;
                }

                const managers = results.map(({ id, name }) => ({
                    name,
                    value: id,
                }));

                // Prompt the user for employee information
                inquirer
                    .prompt([
                        {
                            type: "input",
                            name: "firstName",
                            message: "Enter the employee's first name:",
                        },
                        {
                            type: "input",
                            name: "lastName",
                            message: "Enter the employee's last name:",
                        },
                        {
                            type: "list",
                            name: "roleId",
                            message: "Select the employee role:",
                            choices: roles,
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Select the employee manager:",
                            choices: [
                                { name: "None", value: null },
                                ...managers,
                            ],
                        },
                    ])
                    .then((answers) => {
                        // Insert the employee into the database
                        const sql =
                            "INSERT INTO employee (firstName, lastName, roleId, managerId) VALUES (?, ?, ?, ?)";
                        const values = [
                            answers.firstName,
                            answers.lastName,
                            answers.roleId,
                            answers.managerId,
                        ];
                        connection.query(sql, values, (error) => {
                            if (error) {
                                console.error(error);
                                return;
                            }

                            console.log("Employee added successfully");
                            start();
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        );
    });
}

// adds new manager to the database
function addManager() {
    const queryDepartments = "SELECT * FROM departments";
    const queryEmployees = "SELECT * FROM employee";

    connection.query(queryDepartments, (err, resDepartments) => {
        if (err) throw err;
        connection.query(queryEmployees, (err, resEmployees) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "department",
                        message: "Select the department:",
                        choices: resDepartments.map(
                            (department) => department.departmentName
                        ),
                    },
                    {
                        type: "list",
                        name: "employee",
                        message: "Select the employee to add a manager to:",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.firstName} ${employee.lastName}`
                        ),
                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "Select the employee's manager:",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.firstName} ${employee.lastName}`
                        ),
                    },
                ])
                .then((answers) => {
                    const department = resDepartments.find(
                        (department) =>
                            department.departmentName === answers.department
                    );
                    const employee = resEmployees.find(
                        (employee) =>
                            `${employee.firstName} ${employee.lastName}` ===
                            answers.employee
                    );
                    const manager = resEmployees.find(
                        (employee) =>
                            `${employee.firstName} ${employee.lastName}` ===
                            answers.manager
                    );
                    const query =
                        "UPDATE employee SET managerId = ? WHERE id = ? AND roleId IN (SELECT id FROM roles WHERE departmentId = ?)";
                    connection.query(
                        query,
                        [manager.id, employee.id, department.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(
                                `Added manager ${manager.firstName} ${manager.lastName} to employee ${employee.firstName} ${employee.lastName} in department ${department.departmentName}!`
                            );
                            // restart the application
                            start();
                        }
                    );
                });
        });
    });
}

// updates employee's role
function updateEmployeeRole() {
    const queryEmployees =
        "SELECT employee.id, employee.firstName, employee.lastName, roles.title FROM employee LEFT JOIN roles ON employee.roleId = roles.id";
    const queryRoles = "SELECT * FROM roles";
    connection.query(queryEmployees, (err, resEmployees) => {
        if (err) throw err;
        connection.query(queryRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "Select the employee to update:",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.firstName} ${employee.lastName}`
                        ),
                    },
                    {
                        type: "list",
                        name: "role",
                        message: "Select the new role:",
                        choices: resRoles.map((role) => role.title),
                    },
                ])
                .then((answers) => {
                    const employee = resEmployees.find(
                        (employee) =>
                            `${employee.firstName} ${employee.lastName}` ===
                            answers.employee
                    );
                    const role = resRoles.find(
                        (role) => role.title === answers.role
                    );
                    const query =
                        "UPDATE employee SET roleId = ? WHERE id = ?";
                    connection.query(
                        query,
                        [role.id, employee.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(
                                `Updated ${employee.firstName} ${employee.lastName}'s role to ${role.title} in the database!`
                            );
                            // restart the application
                            start();
                        }
                    );
                });
        });
    });
}

// view employee's by managers 
function viewEmployeesByManager() {
    const query = `
      SELECT 
        e.id, 
        e.firstName, 
        e.lastName, 
        r.title, 
        d.departmentName, 
        CONCAT(m.firstName, ' ', m.lastName) AS managerName
      FROM 
        employee e
        INNER JOIN roles r ON e.roleId = r.id
        INNER JOIN departments d ON r.departmentId = d.id
        LEFT JOIN employee m ON e.managerId = m.id
      ORDER BY 
        managerName, 
        e.lastName, 
        e.firstName
    `;

    connection.query(query, (err, res) => {
        if (err) throw err;

        // group employees by manager
        const employeesByManager = res.reduce((acc, cur) => {
            const managerName = cur.managerName;
            if (acc[managerName]) {
                acc[managerName].push(cur);
            } else {
                acc[managerName] = [cur];
            }
            return acc;
        }, {});

        // display employees by manager
        console.log("Employees by manager:");
        for (const managerName in employeesByManager) {
            console.log(`\n${managerName}:`);
            const employees = employeesByManager[managerName];
            employees.forEach((employee) => {
                console.log(
                    `  ${employee.firstName} ${employee.lastName} | ${employee.title} | ${employee.departmentName}`
                );
            });
        }

        // restart the application
        start();
    });
}

function viewEmployeesByDepartment() {
    const query =
        "SELECT departments.departmentName, employee.firstName, employee.lastName FROM employee INNER JOIN roles ON employee.roleId = roles.id INNER JOIN departments ON roles.departmentId = departments.id ORDER BY departments.departmentName ASC";

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\nEmployees by department:");
        console.table(res);
        // restart the application
        start();
    });
}
//delete department, roles, or employee
function deleteDepartmentsRolesEmployees() {
    inquirer
        // menu for deleting 
        .prompt({
            type: "list",
            name: "data",
            message: "What would you like to delete?",
            choices: ["Employee", "Role", "Department"],
        })
        // handles user input
        .then((answer) => {
            switch (answer.data) {
                case "Employee":
                    deleteEmployee();
                    break;
                case "Role":
                    deleteRole();
                    break;
                case "Department":
                    deleteDepartment();
                    break;
                default:
                    console.log(`Invalid data: ${answer.data}`);
                    start();
                    break;
            }
        });
}
// function that deletes employee
function deleteEmployee() {
    const query = "SELECT * FROM employee";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const employeeList = res.map((employee) => ({
            name: `${employee.firstName} ${employee.lastName}`,
            value: employee.id,
        }));
        employeeList.push({ name: "Go Back", value: "back" }); 
        inquirer
            .prompt({
                type: "list",
                name: "id",
                message: "Select the employee you want to delete:",
                choices: employeeList,
            })
            .then((answer) => {
                if (answer.id === "back") {
                    // check if user selected "back"
                    deleteDepartmentsRolesEmployees();
                    return;
                }
                const query = "DELETE FROM employee WHERE id = ?";
                connection.query(query, [answer.id], (err, res) => {
                    if (err) throw err;
                    console.log(
                        `Deleted employee with ID ${answer.id} from the database!`
                        
                    );
            
                    start();
                });
            });
    });
}

// function that deletes roles
function deleteRole() {
  
    const query = "SELECT * FROM roles";
    connection.query(query, (err, res) => {
        if (err) throw err;
        
        const choices = res.map((role) => ({
            name: `${role.title} (${role.id}) - ${role.salary}`,
            value: role.id,
        }));
 
        choices.push({ name: "Go Back", value: null });
        inquirer
            .prompt({
                type: "list",
                name: "roleId",
                message: "Select the role you want to delete:",
                choices: choices,
            })
            .then((answer) => {
               
                if (answer.roleId === null) {
                    
                    deleteDepartmentsRolesEmployees();
                    return;
                }
                const query = "DELETE FROM roles WHERE id = ?";
                connection.query(query, [answer.roleId], (err, res) => {
                    if (err) throw err;
                    console.log(
                        `Deleted role with ID ${answer.roleId} from the database!`
                    );
                    start();
                });
            });
    });
}

// function that deletes departments
function deleteDepartment() {
 
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentChoices = res.map((department) => ({
            name: department.departmentName,
            value: department.id,
        }));

     
        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message: "Which department do you want to delete?",
                choices: [
                    ...departmentChoices,
                    { name: "Go Back", value: "back" },
                ],
            })
            .then((answer) => {
                if (answer.departmentId === "back") {
                   
                    deleteDepartmentsRolesEmployees();
                } else {
                    const query = "DELETE FROM departments WHERE id = ?";
                    connection.query(
                        query,
                        [answer.departmentId],
                        (err, res) => {
                            if (err) throw err;
                            console.log(
                                `Deleted department with ID ${answer.departmentId} from the database!`
                            );
                          
                            start();
                        }
                    );
                }
            });
    });
}


// allows the user to see the budget of departments
function viewTotalUtilizedBudgetOfDepartment() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentChoices = res.map((department) => ({
            name: department.departmentName,
            value: department.id,
        }));

    
        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message:
                    "Which department do you want to calculate the total salary for?",
                choices: departmentChoices,
            })
            .then((answer) => {
                
                const query =
                    `SELECT 
                    departments.departmentName AS department,
                    SUM(roles.salary) AS total_salary
                  FROM 
                    departments
                    INNER JOIN roles ON departments.id = roles.departmentId
                    INNER JOIN employee ON roles.id = employee.roleId
                  WHERE 
                    departments.id = ?
                  GROUP BY 
                    departments.id;`;
                connection.query(query, [answer.departmentId], (err, res) => {
                    if (err) throw err;
                    const totalSalary = res[0].total_salary;
                    console.log(
                        `The total salary for employees in this department is $${totalSalary}`
                    );
                   
                    start();
                });
            });
    });
}


process.on("exit", () => {
    connection.end();
});