import db from "#db/client";

import { createTask } from "#db/queries/tasks";
import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {

}

// seed.js
const bcrypt = require('bcrypt');
const db = require('./db');
const saltRounds = 10;

async function seed() {
  await db.query('DELETE FROM tasks');
  await db.query('DELETE FROM users');

  const hashed = await bcrypt.hash('password123', saltRounds);

  const userRes = await db.query(`
    INSERT INTO users (username, password)
    VALUES ('testuser', $1)
    RETURNING *;
  `, [hashed]);

  const user = userRes.rows[0];

  await db.query(`
    INSERT INTO tasks (title, done, user_id)
    VALUES
    ('Buy groceries', false, $1),
    ('Finish project', true, $1),
    ('Call mom', false, $1)
  `, [user.id]);
}

seed();
