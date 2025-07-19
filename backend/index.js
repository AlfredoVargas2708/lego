const express = require('express');
const pool = require('./db-config');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/lego', async(req, res) => {
    try {
        const query = 'SELECT * FROM lego';
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Legos no encontrados', data: [] });
        }

        res.status(200).send({ message: 'Legos encontrados', data: result.rows })
    } catch (error) {
        console.error('Error in get route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

app.listen(PORT, () => {
    console.log(`Server running in http://localhost:3000`)
})