const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cyber_regulations',
  password: 'postgresql',
  port: 5432,
});

(async () => {
  try {
    const res = await pool.query('SELECT * from normative');
    console.log('Connessione riuscita:', res.rows);
  } catch (err) {
    console.error('Errore di connessione:', err);
  } finally {
    await pool.end();
  }
})();
