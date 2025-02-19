const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    const query = `
        INSERT INTO monthly_summary (year, month, systema, totalMinutes)
        SELECT year, month, systema, SUM(durationMinutes)
        FROM railway
        GROUP BY year, month, systema
        ON CONFLICT(year, month, systema) DO UPDATE SET totalMinutes=excluded.totalMinutes
    `;
    db.run(query, [], function(err) {
        if (err) {
            console.error('Error updating summary:', err.message);
        } else {
            console.log('Summary updated successfully');
        }
        db.close();
    });
});