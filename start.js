const mysql = require("mysql");
const inq = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Stamina1!",
    database: "employeetracker_db",
});

connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});

// list of options(kicks everything off)
function start() {
    inq.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
            "Add a department",
            "Add a role",
            "Add an employee",
            "View all departments",
            "View all roles",
            "View all employees",
            "View all employees under a manager",
            "Update an employee role",
            "Update an employee's manager",
            "Delete a department",
            "Delete a role",
            "Delete a employee",
            "None",
        ],
    }).then(function (answer) {
        switch (answer.action) {
            case "Add a department":
                addDept();
                break;

            case "Add a role":
                addRole();
                break;

            case "Add an employee":
                addEmployee();
                break;

            case "View all departments":
                viewDepts();
                break;

            case "View all roles":
                viewRoles();
                break;

            case "View all employees":
                viewEmployees();
                break;

            case "View all employees under a manager":
                viewManaged();
                break;

            case "Update an employee role":
                updateRole();
                break;

            case "Update an employee's manager":
                updateManager();
                break;

            case "Delete a department":
                deleteDept();
                break;

            case "Delete a role":
                deleteRole();
                break;

            case "Delete a employee":
                deleteEmployee();
                break;

            case "None":
                console.log("Thank you for using employee tracker!");
                connection.end();
                break;
        }
    });
}

// add departments
function addDept() {
    inq.prompt({
        name: "newDept",
        type: "input",
        message: "What is the name of the department you would like to add?",
    }).then((answer) => {
        connection.query(
            "INSERT INTO department SET ?",
            {
                name: answer.newDept,
            },
            (err) => {
                if (err) throw err;
                console.log("Your department was successfully added!");

                start();
            }
        );
    });
}

// add roles
function addRole() {
    let deptArray = [];
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        inq.prompt([
            {
                name: "title",
                type: "input",
                message: "What is the title of your new role?",
            },
            {
                name: "salary",
                type: "input",
                message: "What is the yearly salary of your new role?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                },
            },
            {
                name: "deptName",
                type: "rawlist",
                choices: () => {
                    for (var i = 0; i < res.length; i++) {
                        deptArray.push(res[i].name);
                    }
                    return deptArray;
                },
                message: "What department will this role will be assigned to?",
            },
        ]).then((answer) => {
            let indexDept = deptArray.indexOf(answer.deptName);
            let deptId = res[indexDept].id;

            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: deptId,
                },
                (err) => {
                    if (err) throw err;
                    console.log("Your role was successfully added!");
                    start();
                }
            );
        });
    });
}


// add employees
function addEmployee() {
    let roleArray = [];
    connection.query("SELECT * FROM role", (err, res) => {
        inq.prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is the employee's first name?",
            },
            {
                name: "lastName",
                type: "input",
                message: "What is the employee's last name?",
            },
            {
                name: "role",
                type: "rawlist",
                choices: () => {
                    for (var i = 0; i < res.length; i++) {
                        roleArray.push(res[i].title);
                    }
                    return roleArray;
                },
                message: "What is the employee's role?",
            },
        ]).then((answer) => {
            let indexRole = roleArray.indexOf(answer.role);
            let role = res[indexRole].id;
            let firstName = answer.firstName;
            let lastName = answer.lastName;
            let managerArray = ["None"];
            connection.query("SELECT * FROM employee", (err, res) => {
                if (err) throw err;
                inq.prompt([
                    {
                        name: "manager",
                        type: "rawlist",
                        choices: () => {
                            for (var i = 0; i < res.length; i++) {
                                managerArray.push(
                                    `${res[i].first_name} ${res[i].last_name}`
                                );
                            }
                            return managerArray;
                        },
                        message: "Who is the employee's manager?",
                    },
                ]).then((answer) => {
                    if (answer.manager !== "None") {
                        let indexMan = managerArray.indexOf(answer.manager) - 1;
                        let managerId = res[indexMan].id;
                        insertEmployee(firstName, lastName, role, managerId);
                    } else {
                        let managerId = null;
                        insertEmployee(firstName, lastName, role, managerId);
                    }
                });
            });
        });
    });
}

function insertEmployee(firstName, lastName, role, managerId) {
    connection.query(
        "INSERT INTO employee SET ?",
        {
            first_name: firstName,
            last_name: lastName,
            role_id: role,
            manager_id: managerId,
        },
        (err) => {
            if (err) throw err;
            console.log("Your employee was successfully added!");
            start();
        }
    );
}

// view departments
function viewDepts() {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        var deptArray = [];
        for (var i = 0; i < res.length; i++) {
            deptArray.push(res[i].name);
        }
        console.table("Departments", [deptArray]);
        start();
    });
}

// view roles
function viewRoles() {
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        var rolesArray = [];
        for (var i = 0; i < res.length; i++) {
            rolesArray.push(res[i].title);
        }
        console.table("Roles", [rolesArray]);
        start();
    });
}

// view employees
function viewEmployees() {
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        let employeesArray = [];
        let employee = {};
        for (var i = 0; i < res.length; i++) {
            employeesArray.push(`${res[i].first_name} ${res[i].last_name}`);
        }
        console.table("Employees", [employeesArray]);
        start();
    });
}

// update employee roles
function updateRole() {
    let employeeArray = [];
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        inq.prompt([
            {
                name: "selection",
                type: "rawlist",
                choices: () => {
                    for (var i = 0; i < res.length; i++) {
                        employeeArray.push(
                            `${res[i].first_name} ${res[i].last_name}`
                        );
                    }
                    return employeeArray;
                },
                message: "Which employee's role would you like to update?",
            },
        ]).then((answer) => {
            var rolesArray = [];
            let indexEmp = employeeArray.indexOf(answer.selection);
            let employeeId = res[indexEmp].id;

            connection.query("SELECT * FROM role", (err, res) => {
                if (err) throw err;

                inq.prompt([
                    {
                        name: "roleChange",
                        type: "rawlist",
                        choices: () => {
                            for (var i = 0; i < res.length; i++) {
                                rolesArray.push(res[i].title);
                            }
                            return rolesArray;
                        },
                        message:
                            "Which role would you like to change the employee to?",
                    },
                ]).then((answer) => {
                    let indexId = rolesArray.indexOf(answer.roleChange);
                    let newRoleId = res[indexId].id;
                    connection.query(
                        "UPDATE employee SET ? WHERE ?",
                        [{ role_id: newRoleId }, { id: employeeId }],
                        (err, res) => {
                            console.log("Your employee role was updated");
                            start();
                        }
                    );
                });
            });
        });
    });
}

// update employee manager
function updateManager() {
    let employeeArray = [];
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        inq.prompt([
            {
                name: "selection",
                type: "rawlist",
                choices: () => {
                    for (var i = 0; i < res.length; i++) {
                        employeeArray.push(
                            `${res[i].first_name} ${res[i].last_name}`
                        );
                    }
                    return employeeArray;
                },
                message: "Which employee will receive a manager update?",
            },
        ]).then((answer) => {
            let indexEmp = employeeArray.indexOf(answer.selection);
            let employeeId = res[indexEmp].id;

            inq.prompt([
                {
                    name: "manSel",
                    type: "rawlist",
                    choices: employeeArray,
                    message: "Which employee will be the new manager?",
                },
            ]).then((ans) => {
                let indexEmp = employeeArray.indexOf(ans.manSel);
                let managerId = res[indexEmp].id;

                connection.query(
                    "UPDATE employee SET ? WHERE ?",
                    [{ manager_id: managerId }, { id: employeeId }],
                    (err, res) => {
                        if (err) throw err;
                        console.log("Your employee manager was updated");
                        start();
                    }
                );
            });
        });
    });
}

// view employees under a manager
function viewManaged() {
    connection.query("SELECT * FROM employee", (err, res) => {
        let employeeArray = [];
        if (err) throw err;
        inq.prompt([
            {
                name: "selection",
                type: "rawlist",
                choices: () => {
                    for (var i = 0; i < res.length; i++) {
                        employeeArray.push(
                            `${res[i].first_name} ${res[i].last_name}`
                        );
                    }
                    return employeeArray;
                },
                message: "See managed employees for which manager?",
            },
        ]).then((answer) => {
            managedArray = [];
            let indexEmp = employeeArray.indexOf(answer.selection);
            let employeeId = res[indexEmp].id;
            for (var i = 0; i < res.length; i++) {
                if (res[i].manager_id === employeeId) {
                    managedArray.push(
                        `${res[i].first_name} ${res[i].last_name}`
                    );
                }
            }
            console.table(`Employees managed by ${answer.selection}`, [
                managedArray,
            ]);
        });
    });
}

// delete departments
function deleteDept() {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        var deptArray = [];
        inq.prompt([
            {
                name: "dept",
                type: "rawlist",
                choices: () => {
                    for (var i = 0; i < res.length; i++) {
                        deptArray.push(res[i].name);
                    }
                    return deptArray;
                },
                message: "Which department would you like to delete?",
            },
        ]).then((answer) => {
            let indexDept = deptArray.indexOf(answer.dept);
            let deptId = res[indexDept].id;

            connection.query(
                "DELETE FROM department WHERE ?",
                {
                    id: deptId,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log("The department has been deleted.");
                    start();
                }
            );
        });
    });
}

// delete roles
function deleteRole() {
    connection.query("SELECT * FROM role", (err, res) => {
        let rolesArray = [];
        if (err) throw err;
        inq.prompt([
            {
                name: "role",
                type: "rawlist",
                choices: () => {
                    for (var i = 0; i < res.length; i++) {
                        rolesArray.push(res[i].title);
                    }
                    return rolesArray;
                },
                message: "Which role would you like to delete?",
            },
        ]).then((answer) => {
            let indexId = rolesArray.indexOf(answer.role);
            let delRole = res[indexId].id;
            connection.query(
                "DELETE FROM role WHERE ?",
                {
                    id: delRole,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log("Your role has been deleted.");
                    start();
                }
            );
        });
    });
}

// delete employees
function deleteEmployee() {
    let employeeArray = [];
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        inq.prompt([
            {
                name: "selection",
                type: "rawlist",
                choices: () => {
                    for (var i = 0; i < res.length; i++) {
                        employeeArray.push(
                            `${res[i].first_name} ${res[i].last_name}`
                        );
                    }
                    return employeeArray;
                },
                message: "Which employee will be deleted?",
            },
        ]).then((answer) => {
            let indexEmp = employeeArray.indexOf(answer.selection);
            let employeeId = res[indexEmp].id;
            connection.query(
                "DELETE FROM employee WHERE ?",
                {
                    id: employeeId,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log("Your employee has been deleted.");
                    start();
                }
            );
        });
    });
}
