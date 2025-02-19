require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.URLFRONTEND || 'http://localhost:3000/',
    credentials: true,
})); // Habilitar CORS
app.use(bodyParser.json());
app.use(express.static('public'));

// Conectar a la base de datos MySQL
const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Función para convertir fechas al formato correcto
function formatDate(dateString) {
    const [day, month, year, time] = dateString.split(/[/\s:]/);
    return `${year}-${month}-${day} ${time}`;
}

// Ruta para obtener los datos agrupados por sistema, mes y año
app.get('/api/datos', (req, res) => {
    const query = `
        SELECT \`system\` as sistema, SUM(durationMinutes) as minutos, month, year
        FROM records
        GROUP BY sistema, month, year
        ORDER BY year, month
    `;
    db.query(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(rows); // Agregar este log para verificar los datos obtenidos
        res.json(rows);
    });
});

// Ruta para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Obtener todos los registros
app.get('/api/records', (req, res) => {
    db.query('SELECT * FROM records', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log('Registros obtenidos:', rows);
            res.json(rows);
        }
    });
});

// Obtener un registro por ID
app.get('/api/records/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM records WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log('Registro obtenido:', row);
            res.json(row);
        }
    });
});

// Agregar un nuevo registro
app.post('/api/records', (req, res) => {
    const { year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations } = req.body;
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const query = `INSERT INTO records (year, month, timestamp, email, startDate, \`system\`, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [year, month, timestamp, email, formattedStartDate, system, problem, caseNumber, incidentType, contingencyAction, formattedEndDate, durationMinutes, durationDays, observations], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log('Registro agregado:', result.insertId);
            res.json({ id: result.insertId });
        }
    });
});

// Actualizar un registro existente
app.put('/api/records/:id', (req, res) => {
    const { id } = req.params;
    const { year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations } = req.body;
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const query = `UPDATE records SET year = ?, month = ?, timestamp = ?, email = ?, startDate = ?, \`system\` = ?, problem = ?, caseNumber, incidentType, contingencyAction, endDate = ?, durationMinutes = ?, durationDays = ?, observations = ? WHERE id = ?`;
    db.query(query, [year, month, timestamp, email, formattedStartDate, system, problem, caseNumber, incidentType, contingencyAction, formattedEndDate, durationMinutes, durationDays, observations, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log('Registro actualizado:', id);
            res.json({ updated: result.affectedRows });
        }
    });
});

// Eliminar un registro
app.delete('/api/records/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM records WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log('Registro eliminado:', id);
            res.json({ deleted: result.affectedRows });
        }
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});