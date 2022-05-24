BEGIN;
INSERT INTO department (department_name)
VALUES ("marketing"),
       ("accounting"),
       ("admin");

INSERT INTO roles (title, salary, department_id)
VALUES ("junior manager", "60000", LAST_INSERT_ID()),
       ("senior manager", "68000", LAST_INSERT_ID()),
       ("vice president", "250000", LAST_INSERT_ID());

INSERT INTO employee (first_name, last_name, roles_id, manager_id)
VALUES ("doug", "smalls", LAST_INSERT_ID(), LAST_INSERT_ID()),
       ("kevin", "green", LAST_INSERT_ID(), LAST_INSERT_ID()),
       ("violet", "stevens", LAST_INSERT_ID(), LAST_INSERT_ID());
COMMIT;    