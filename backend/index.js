const express = require("express");
const pool = require("./db-config");
const { createPagination } = require("./pagination");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/lego", async (req, res) => {
  try {
    const { page, pageSize } = req.query;

    if (!page || !pageSize) {
      return res.status(400).send({
        message: "Faltan elementos a la consulta",
        data: [],
      });
    }

    const offset = (page - 1) * pageSize;

    const dataQuery = "SELECT * FROM lego LIMIT $1 OFFSET $2";
    const countQuery = "SELECT COUNT(*) FROM lego";

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [pageSize, offset]),
      pool.query(countQuery),
    ]);

    const totalLegos = parseInt(countResult.rows[0].count);

    res.status(200).send({
      message: dataResult.rows.length
        ? "Legos encontrados"
        : "Legos no encontrados",
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalLegos,
        totalPages: Math.ceil(totalLegos / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in get route:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.get("/search/:column/:value", async (req, res) => {
  try {
    const { column, value } = req.params;
    const { page, pageSize } = req.query;

    if (!column || !value || !page || !pageSize) {
      return res
        .status(400)
        .send({ message: "Faltan valores a la consulta", data: [] });
    }

    const offset = (page - 1) * pageSize;

    const query = `SELECT * FROM lego WHERE ${column} = $1 LIMIT $2 OFFSET $3`;
    const result = await pool.query(query, [value, pageSize, offset]);

    res.status(200).send({
      message: "Legos encontrados",
      data: result.rows,
      pagination: {
        page,
        pageSize,
        totalLegos: result.rows.length,
        totalPages: Math.ceil(result.rows.length / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in search route:", error);
    res.status(500).send({ message: "Internal Server Error:", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running in http://localhost:3000`);
});
