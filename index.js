const { Pool } = require("pg");
const dotenv = require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const { error } = require("console");
const multer = require("multer");

const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2
});

pool.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
    } else {
        console.log("Successful connection to the database");
    }
});

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(bodyparser.json());
const upload = multer();

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false })); // <--- middleware configuration

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/manage", (req, res) => {
  let sql = "SELECT COUNT(*) FROM customer";

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error during query execution:", err);
      return;
    }
    res.render("manage", {model: results.rows[0].count});
  });
});

app.get("/api/manage", (req, res) => {
  const { id, firstname, lastname, state, sales, previous } = req.query;

  let sql = "SELECT * FROM customer WHERE 1=1";

  const params = [];

  if (id) {
    sql += ` AND cusid = $${params.length + 1}`;
    params.push(id);
  }

  if (firstname) {
    sql += ` AND LOWER(cusfname) LIKE LOWER($${params.length + 1})`;
    params.push(`${firstname}%`);
  }

  if (lastname) {
    sql += ` AND LOWER(cuslname) LIKE LOWER($${params.length + 1})`;
    params.push(`${lastname}%`);
  }

  if (state) {
    sql += ` AND LOWER(cusstate) = LOWER($${params.length + 1})`;
    params.push(state);
  }

  if (sales) {
    sql += ` AND cussalesytd >= $${params.length + 1}`;
    params.push(sales);
  }

  if (previous) {
    sql += ` AND cussalesprev >= $${params.length + 1}`;
    params.push(previous);
  }

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error during query execution:", err);
      return;
    }
    res.send(results.rows);
  });
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/create", (req, res) => {
  const { id, firstname, lastname, state, sales, previous } = req.body;

  if (!id || !firstname || !lastname) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const sql = `
    INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev)
    VALUES ($1, $2, $3, UPPER($4), $5, $6)
  `;

  const params = [id, firstname, lastname, state, sales, previous];

  pool.query(sql, params, (err) => {
    if (err) {
      console.error("Erreur during insertion:", err);
      return res.status(409).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: "Customer added successfully." });
  });
});

// GET /delete/XXX
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM customer WHERE cusid = $1";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error during query execution:", err);
      return;
    }
    res.render("delete", { model: result.rows[0] });
  });
});

// POST /delete/XXX
app.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM customer WHERE cusid = $1";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error during query execution:", err);
      return;
    }
    res.status(204).send();
  });
});

// GET /edit/XXX
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM customer WHERE cusid = $1";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error during query execution:", err);
      return;
    }
    res.render("edit", { model: result.rows[0] });
  });
});

// POST /edit/XXX
app.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, state, sales, previous } = req.body;

  const sql = `UPDATE customer SET cusfname = $2, cuslname = $3, cusstate = $4, cussalesytd = $5, cussalesprev = $6 WHERE cusid = $1`;
  pool.query(sql, [id, firstname, lastname, state, sales, previous], (err, result) => {
    if (err) {
      console.error("Error update:", err);
      return;
    } 
    res.status(204).send();
  });
});

app.get("/import", (req, res) => {
  let sql = "SELECT COUNT(*) FROM customer";

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error during query execution:", err);
      return;
    }
    res.render("import", {model: results.rows[0].count});
  });
});

app.post("/import", upload.single('filename'), async (req, res) => {
  if(!req.file || Object.keys(req.file).length === 0) {
    const message = "Error: Import file not uploaded";

    return res.send(message);
  };
  const errors = [];

  const buffer = req.file.buffer;
  const lines = buffer.toString().split(/\r?\n/);
  const sql = `INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev)
              VALUES ($1, $2, $3, $4, $5, $6)
  `;

  for(const customer of lines) {
    const part = customer.split(",");
    try {
      await pool.query(sql, part);
    } catch(e) {
      errors.push(`Customer id: ${part[0]} - ${e.message}`);
    }
  }

  res.send({
    process: lines.length,
    success: lines.length - errors.length,
    failed: errors.length,
    errors
  });
});

app.get("/export", (req, res) => {
  let sql = "SELECT COUNT(*) FROM customer";

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error during query execution:", err);
      return;
    }
    res.render("export", {model: results.rows[0].count});
  });
});

app.post("/export", (req, res) => {
  const fileName = req.body.filetName || "export.txt";
  const sql = "SELECT * FROM customer ORDER BY cusid";

  pool.query(sql, [], (err, result) => {
    if (err) {
      const message = `Error - ${err.message}`;
      res.render("export", { message });
    } else {
      let output = result.rows
        .map(
          (customer) =>
            [customer.cusid,
            customer.cusfname,
            customer.cuslname,
            customer.cusstate,
            customer.cussalesytd.toString().replace(/[\$,]/g, ""),
            customer.cussalesprev.toString().replace(/[\$,]/g, "")].join(",")
        )
        .join("\r\n");

      res.header("Content-Type", "text/csv");
      res.attachment(fileName);
      res.send(output);
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started (http://localhost:${port}/)`);
});