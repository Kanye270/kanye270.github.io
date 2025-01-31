const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year TEXT,
        month TEXT,
        timestamp TEXT,
        email TEXT,
        startDate TEXT,
        system TEXT,
        problem TEXT,
        caseNumber TEXT,
        incidentType TEXT,
        contingencyAction TEXT,
        endDate TEXT,
        durationMinutes INTEGER,
        durationDays INTEGER,
        observations TEXT
    )`);
});

// Ruta para obtener los datos agrupados por sistema, mes y año
app.get('/api/datos', (req, res) => {
    const query = `
        SELECT system as sistema, SUM(durationMinutes) as minutos, month, year
        FROM records
        GROUP BY sistema, month, year
        ORDER BY year, month
    `;
    db.all(query, [], (err, rows) => {
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
    db.all('SELECT * FROM records', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// Obtener un registro por ID
app.get('/api/records/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM records WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(row);
        }
    });
});

// Agregar un nuevo registro
app.post('/api/records', (req, res) => {
    const { year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations } = req.body;
    db.run(`INSERT INTO records (year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations],
        function(err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ id: this.lastID });
            }
        });
});

// Actualizar un registro existente
app.put('/api/records/:id', (req, res) => {
    const { id } = req.params;
    const { year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations } = req.body;
    db.run(`UPDATE records SET year = ?, month = ?, timestamp = ?, email = ?, startDate = ?, system = ?, problem = ?, caseNumber = ?, incidentType = ?, contingencyAction = ?, endDate = ?, durationMinutes = ?, durationDays = ?, observations = ? WHERE id = ?`,
        [year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations, id],
        function(err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ updated: this.changes });
            }
        });
});

// Eliminar un registro
app.delete('/api/records/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM records WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ deleted: this.changes });
        }
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});