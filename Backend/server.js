const http = require('http'); //lädt das HTTP-Modul, um einen WebServer zu erstellen
const sqlite3 = require('sqlite3'); //SQLite3 Modul für die Datenbankverbindung
const sqlite = require('sqlite');

const hostname = '127.0.0.1'; // Server läuft lokal
const port = 3000;
const dbPath = 'data.db'; //Pfad zur SQLite-Datenbankdatei
let db;

async function initDB() { //Startet die Datenbank
  db = await sqlite.open({ filename: dbPath, driver: sqlite3.Database }); //erstellt Tabelle, falls sie noch nicht existiert
  await db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    day TEXT,
    content TEXT,
    color TEXT
  )`);
}

const server = http.createServer(async (req, res) => { //Erstellt den Server
  res.setHeader('Access-Control-Allow-Origin', '*'); //Frontend darf auf Backend zugreifen
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS'); //Erlaubt die Methoden GET, POST, DELETE und OPTIONS
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { //Wenn der Browser "darf ich? fragt..."
    res.writeHead(204); //.. sagt "ja, du darfst"...
    res.end(); //... Antwort beenden.
    return; //Funktion abbrechen, damit nicht weiterverarbeitet wird zB keine Einträge löschen oder schreiben
  }

  const url = new URL(req.url, `http://${req.headers.host}`); //URL Parsen
  const id = url.pathname.split('/')[2];

  if (url.pathname === '/entries' && req.method === 'GET') {
    const entries = await db.all('SELECT * FROM entries'); //Alle Einträge aus der Datenbank abfragen und auslesen
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(entries)); //Einträge als JSON zurückgeben
  }

  else if (url.pathname === '/entries' && req.method === 'POST') {
    let data = '';
    req.on('data', chunk => (data += chunk)); //Daten sammeln
    req.on('end', async () => {
      const entry = JSON.parse(data); //JSON Daten in ein Objekt umwandeln
      await db.run(
        'INSERT INTO entries (type, day, content, color) VALUES (?, ?, ?, ?)',
        [entry.type, entry.day, entry.content, entry.color] //Daten in die Datenbank einfügen
      );
      res.writeHead(200);
      res.end();
    });
  }

  else if (url.pathname.startsWith('/entries/') && req.method === 'DELETE') {
    await db.run('DELETE FROM entries WHERE id = ?', id); //Eintrag mit der angegebenen ID löschen
    res.writeHead(200);
    res.end();
  }

  else {
    res.writeHead(404); //Fehler 404, wenn die URL nicht gefunden wurde
    res.end();
  }
});

initDB().then(() => {
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
});
