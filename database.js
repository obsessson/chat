const Database = require('better-sqlite3');

const db = new Database('chat.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT UNIQUE,
  password TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT,
  user_id INTEGER
)
`).run();

module.exports = {
  isUserExist(login) {
    const user = db.prepare(
      'SELECT * FROM users WHERE login = ?'
    ).get(login);

    return !!user;
  },

  addUser(user) {
    db.prepare(
      'INSERT INTO users(login, password) VALUES (?, ?)'
    ).run(user.login, user.password);
  },

  getAuthToken(user) {
    const foundUser = db.prepare(
      'SELECT * FROM users WHERE login = ? AND password = ?'
    ).get(user.login, user.password);

    if(!foundUser) {
      throw new Error('Invalid login or password');
    }

    return `${foundUser.id}.${foundUser.login}`;
  },

  addMessage(message, userId) {
    db.prepare(
      'INSERT INTO messages(text, user_id) VALUES (?, ?)'
    ).run(message, userId);
  },

  getMessages() {
    const rows = db.prepare(`
      SELECT users.login, messages.text
      FROM messages
      JOIN users ON users.id = messages.user_id
    `).all();

    return rows.map(row => `${row.login}: ${row.text}`);
  }
};