const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    const query = `
        INSERT INTO monthly_summary (year, month, system, totalHours)
        SELECT strftime('%Y', startDate) as year, strftime('%m', startDate) as month, system, SUM(durationMinutes) / 60.0 as totalHours
        FROM records
        WHERE strftime('%Y-%m', startDate) = strftime('%Y-%m', 'now', 'start of month', '-1 month')
        GROUP BY year, month, system
    `;
    db.run(query, function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Monthly summary updated successfully');
        }
    });
});

db.close();