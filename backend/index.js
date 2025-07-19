const express = require('express');
const pool = require('./db-config');
const { createPagination } = require('./pagination');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/lego', async(req, res) => {
    try {
        const { page, pageSize } = req.query;

        if (!page || !pageSize) {
            return res.status(404).send({ message: 'Faltan elementos a la consulta', data: [] });
        }

        const offset = (page -1) * pageSize;

        const query = 'SELECT * FROM lego LIMIT $1 OFFSET $2';
        const result = await pool.query(query, [pageSize, offset]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Legos no encontrados', data: [] });
        }

        const pagination = await createPagination(pool, page, pageSize);

        res.status(200).send({ message: 'Legos encontrados', data: result.rows, pagination })
    } catch (error) {
        console.error('Error in get route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running in http://localhost:3000`)
})