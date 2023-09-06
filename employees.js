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

let mysql = require("mysql");
let connData = {
    host: "localhost",
    user: 'root',
    password: "",
    database: "employee"
};
let connection = mysql.createConnection(connData);

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the database");
});

// app.get("/employees", (req, res) => {
//     connection.query("SELECT * FROM employees", (err, results) => {
//         if (err) {
//             console.error("Error fetching employees:", err);
//             res.status(500).json({ error: "Internal Server Error" });
//             return;
//         }
//         res.json(results);
//     });
// });


app.get("/employees", (req, res) => {
    const { department, designation, gender } = req.query;

    // Define the base SQL query
    let sql = "SELECT * FROM employees WHERE 1";

    // Check if 'department' parameter exists and add it to the SQL query
    if (department) {
        sql += ` AND department = '${department}'`;
    }

    // Check if 'designation' parameter exists and add it to the SQL query
    if (designation) {
        sql += ` AND designation = '${designation}'`;
    }

    // Check if 'gender' parameter exists and add it to the SQL query
    if (gender) {
        sql += ` AND gender = '${gender}'`;
    }

    // Execute the query
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching employees:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json(results);
    });
});


app.get("/employees/:empCode", (req, res) => {
    const { empCode } = req.params; // Removed the '+' here
    connection.query("SELECT * FROM employees WHERE empCode = ?", [empCode], (err, results) => {
        if (err) {
            console.error("Error fetching Employee by ID:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: "Employee not found" }); // Updated the error message
        } else {
            res.json(results[0]);
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
    const { department } = req.params; // Changed 'brand' to 'department'
    connection.query("SELECT * FROM employees WHERE department = ?", [department], (err, results) => { // Changed 'designetion' to 'department'
        if (err) {
            console.error("Error fetching employees by department:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json(results);
    });
});


app.post("/employees", (req, res) => {
    const { empCode, name, department, designation, salary, gender } = req.body;
    connection.query(
        "INSERT INTO employees (empCode,name,department,designation,salary,gender) VALUES (?, ?, ?, ?, ?, ?)",
        [empCode, name, department, designation, salary, gender],
        (err, results) => {
            if (err) {
                console.error("Error adding employee:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }
            res.status(201).json({ message: "Employee added successfully", id: results.insertId });
        }
    );
});

app.put("/employees/:empCode", (req, res) => {
    const { empCode } = req.params;
    const { name, department, designation, salary, gender } = req.body;
    connection.query(
        "UPDATE employees SET name = ?, department = ?, designation = ?, salary = ?, gender = ? WHERE empCode = ?",
        [name, department, designation, salary, gender, empCode],
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
    connection.query("DELETE FROM employees WHERE empCode = ?", [id], (err) => {
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

