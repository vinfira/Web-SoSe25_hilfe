document.addEventListener('DOMContentLoaded', () => { //Warten bis das DOM geladen ist
  const form = document.getElementById('entryForm'); //Formular mit der ID
  const type = document.getElementById('type'); 
  const day = document.getElementById('day'); 
  const content = document.getElementById('content'); //Textarea für den Inhalt der Einträge
  const color = document.getElementById('color'); //Farbwähler für die Farbe der Einträge

  form.addEventListener('submit', async (e) => { //Event Listener für das Absenden des Formulars
    e.preventDefault(); //Verhindert das Standardverhalten des Formulars (Neuladen der Seite)

    const entry = { //Erstellt ein neues Objekt mit den Werten aus dem Formular
      type: type.value,
      day: day.value,
      content: content.value,
      color: color.value
    };

    await fetch('http://localhost:3000/entries', { //Sendet Daten mit der mit der POST-Methode an das Backend (Server)
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, //Daten werden als JSON gesendet
      body: JSON.stringify(entry) //Das Objekt "Entry" wird in einen JSON-String umgewandelt
    });

    form.reset(); //Formular zurücksetzen, damit ein neuer Antrag erstellt werden kann
    loadEntries(); //Lädt Einträge neu, um den neuen Eintrag anzuzeigen
  });

  async function loadEntries() { //Lädt alle Einträge vom Server
    document.querySelectorAll('.day-column').forEach(col => col.querySelectorAll('.entry').forEach(e => e.remove())); //Entfernt alle bestehenden Einträge aus den Tages-Spalten

    const response = await fetch('http://localhost:3000/entries'); //Ruft alle Einträge vom Server ab
    const entries = await response.json();

    entries.forEach(createEntryElement); //Für jeden Eintrag wird die Funktion createEntryElement genutzt, um die Einträge anzuzeigen
  }

  function createEntryElement(entry) { //erstellt ein neues HTML Element für jeden Eintrag
    const entryDiv = document.createElement('div'); //Erstellt ein neues Div-Element für den Eintrag mit der Basis-Farbe Grau
    entryDiv.className = 'entry';
    entryDiv.style.backgroundColor = entry.color || '#ccc';
    entryDiv.innerHTML = `
      <strong>${entry.type}</strong><br>${entry.content} 
      <button class="delete-btn" data-id="${entry.id}">&times;</button>
    `; //Fügt den Inhalt in Div Element ein, inklusive Lösch-Button und Fettgeschriebenem Typ des Eintrags

    const dayCol = document.querySelector(`.day-column[data-day="${entry.day}"]`); //Sucht die Tages-Spalte, die dem Eintrag entspricht
    if (dayCol) {
      dayCol.appendChild(entryDiv); //Fügt das neue Eintrag-Element in die entsprechende Tages-Spalte ein
    }

    entryDiv.querySelector('.delete-btn').addEventListener('click', async () => { //Löschen bei Klick auf das X
      await fetch(`http://localhost:3000/entries/${entry.id}`, { method: 'DELETE' }); //Sendet DELETE-Anfrage an den Server, um den EIntrag zu löschen
      loadEntries(); //Lädt die Einträge neu, um Liste zu aktualisieren
    });
  }

  loadEntries(); // Seite initial laden
});
