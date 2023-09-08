let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GEt, POST , OPTIONS, PUT, PATCH,DELETE,HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept"
    );
    next();
});
const port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const { Client } = require("pg");
const connection = new Client({
    user: "postgres",
    password: "Abhay7830928904",
    database: "postgres",
    port: 5432,
    host: "db.umomdwazywxixarejixy.supabase.co",
    ssl: { rejectUnauthorized: false },
});
connection.connect(function (res, error) {
    console.log(`connected!!!`);
});




app.get("/employees", (req, res, next) => {
    const { department, designation, gender } = req.query;
    let sql = `SELECT * FROM employees WHERE 1=1`;
    const values = [];
    if (department) {
        sql += ` AND department = $1`;
        values.push(department);
    }
    if (designation) {
        sql += ` AND designation = $1`;
        values.push(designation);
    }
    if (gender) {
        sql += ` AND gender = $1`;
        values.push(gender);
    }
    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error("Error fetching employees:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.send(results.rows);
        
    });
});


app.get("/employees/:empcode", (req, res, next) => {
    const { empcode } = req.params; 
    connection.query(`SELECT * FROM employees WHERE empcode = $1`, [empcode], (err, results) => {
        if (err) {
            console.error("Error fetching Employee by ID:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: "Employee not found" }); 
        } else {
            res.json(results.rows[0]);
        }
    });
});

app.get("/employees/designation/:designation", (req, res) => {
    const { designation } = req.params;
    connection.query("SELECT * FROM employees WHERE designation = ?", [designation], (err, results) => {
        if (err) {
            console.error("Error fetching employees by designation:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json(results);
    });
});

app.get("/employees/department/:department", (req, res) => {
    const { department } = req.params;
    connection.query("SELECT * FROM employees WHERE department = ?", [department], (err, results) => {
        if (err) {
            console.error("Error fetching employees by department:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json(results);
    });
});


app.post("/employees", (req, res, next) => {
    const { empcode, name, department, designation, salary, gender } = req.body;
    connection.query(
        "INSERT INTO employees (empcode,name,department,designation,salary,gender) VALUES ($1, $2, $3, $4, $5, $6)",
        [empcode, name, department, designation, salary, gender],
        (err, results) => {
            if (err) {
                console.error("Error adding employee:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }
            res.status(201).json({ message: "Employee added successfully", id: results.rows });
        }
    );
});

app.put("/employees/:empcode", (req, res, next) => {
    const { empcode } = req.params;
    const { name, department, designation, salary, gender } = req.body;
    connection.query(
        "UPDATE employees SET name = $1, department = $2, designation = $3, salary = $4, gender = $5 WHERE empcode = $6",
        [name, department, designation, salary, gender, empcode],
        (err) => {
            if (err) {
                console.error("Error updating employee:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }
            res.json({ message: "Employee updated successfully" });
        }
    );
});


app.delete("/employees/:id", (req, res) => {
    const { id } = req.params;
    connection.query("DELETE FROM employees WHERE empcode = $1", [id], (err) => {
        if (err) {
            console.error("Error deleting employee:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json({ message: "employees deleted successfully" });
    });
});

app.get("/employees/resetData", (req, res) => {
    // You can implement data reset logic here, such as truncating the table.
    connection.query("TRUNCATE TABLE employess", (err) => {
        if (err) {
            console.error("Error resetting data:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json({ message: "Data reset successfully" });
    });
});

