USE employeetracker_db;

INSERT INTO department (name)
VALUES ("Food");

INSERT INTO department (name)
VALUES ("Sales");

INSERT INTO department (name)
VALUES ("Televisions");

INSERT INTO department (name)
VALUES ("Specialist");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Manager", 80000, 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Consultant", 50000 , 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Home Theater Manager", 75000, 3);

INSERT INTO role (title, salary, department_id)
VALUES ("Home Theater Expert", 50000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Joe", "Dirt", 1, null );

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Richard", "Hayden", 2, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Emperor", "Kuzco", 3, null);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Dickie", "Roberts", 4, 1);