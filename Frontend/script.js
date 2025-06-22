const form = document.getElementById('entryForm');
const planner = document.getElementById('planner');
const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

function createColumn(day) {
  const column = document.createElement('div');
  column.className = 'day-column';
  column.dataset.day = day;
  const title = document.createElement('h3');
  title.textContent = day;
  column.appendChild(title);
  planner.appendChild(column);
}

function renderEntry(entry) {
  const column = document.querySelector(`[data-day="${entry.day}"]`);
  const div = document.createElement('div');
  div.className = 'entry';
  div.style.backgroundColor = entry.color;
  div.innerHTML = `
    <span>${entry.type}: ${entry.content}</span>
    <button onclick="deleteEntry(${entry.id})">🗑️</button>
  `;
  column.appendChild(div);
}

async function loadEntries() {
  const res = await fetch('http://localhost:3000/entries');
  const entries = await res.json();
  planner.innerHTML = '';
  days.forEach(createColumn);
  entries.forEach(renderEntry);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const entry = {
    type: formData.get('type'),
    day: formData.get('day'),
    content: formData.get('content'),
    color: formData.get('color'),
  };

  await fetch('http://localhost:3000/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });

  form.reset();
  loadEntries();
});

async function deleteEntry(id) {
  await fetch(`http://localhost:3000/entries/${id}`, {
    method: 'DELETE',
  });
  loadEntries();
}

loadEntries();
