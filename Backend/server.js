const http = require('http');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const hostname = '127.0.0.1';
const port = 3000;
const dbPath = 'data.db';
let db;

async function initDB() {
  db = await sqlite.open({ filename: dbPath, driver: sqlite3.Database });
  await db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    day TEXT,
    content TEXT,
    color TEXT
  )`);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.pathname.split('/')[2];

  if (url.pathname === '/entries' && req.method === 'GET') {
    const entries = await db.all('SELECT * FROM entries');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(entries));
  }

  else if (url.pathname === '/entries' && req.method === 'POST') {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', async () => {
      const entry = JSON.parse(data);
      await db.run(
        'INSERT INTO entries (type, day, content, color) VALUES (?, ?, ?, ?)',
        [entry.type, entry.day, entry.content, entry.color]
      );
      res.writeHead(200);
      res.end();
    });
  }

  else if (url.pathname.startsWith('/entries/') && req.method === 'DELETE') {
    await db.run('DELETE FROM entries WHERE id = ?', id);
    res.writeHead(200);
    res.end();
  }

  else {
    res.writeHead(404);
    res.end();
  }
});

initDB().then(() => {
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
});
