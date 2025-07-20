const express = require("express");
const pool = require("./db-config");
const { scrapping } = require("./webScrapping");
const capitalize = require('./capitalize');

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/nombres-columnas/:tabla", async (req, res) => {
  try {
    const { tabla } = req.params;
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;

    const result = await pool.query(query, [tabla]);
    const nombresColumnas = result.rows.filter((row) => row.column_name !== 'id');

    res.json({
      tabla: tabla,
      nombres_columnas: nombresColumnas.map(row => capitalize(row.column_name)),
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los nombres de las columnas" });
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

    const count = await pool.query(
      `SELECT COUNT(*) FROM lego WHERE ${column} = $1`,
      [value]
    );

    const imgData = await scrapping(result.rows);

    res.status(200).send({
      message: "Legos encontrados",
      data: result.rows,
      imgData,
      pagination: {
        page,
        pageSize,
        totalLegos: count.rows[0].count,
        totalPages: Math.ceil(count.rows[0].count / pageSize),
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
