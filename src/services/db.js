import pkg from 'pg';
const { Pool } = pkg;

// Crée une pool PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'musique_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

// Initialiser la table si elle n'existe pas
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS musiques (
        id SERIAL PRIMARY KEY,
        nom TEXT NOT NULL,
        auteur TEXT NOT NULL,
        votes INTEGER DEFAULT 0
      );
    `);
  } finally {
    client.release();
  }
}

// Ajouter une musique
export async function addMusique(nom, auteur) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO musiques (nom, auteur, votes) VALUES ($1, $2, 0) RETURNING id',
      [nom, auteur]
    );
    return result.rows[0].id;
  } finally {
    client.release();
  }
}

// Récupérer toutes les musiques
export async function getAllMusiques() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM musiques ORDER BY votes DESC');
    return result.rows;
  } finally {
    client.release();
  }
}

// Voter pour une musique
export async function voteMusique(id) {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE musiques SET votes = votes + 1 WHERE id = $1',
      [id]
    );
  } finally {
    client.release();
  }
}

export { pool };