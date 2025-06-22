document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('entryForm');
  const type = document.getElementById('type');
  const day = document.getElementById('day');
  const content = document.getElementById('content');
  const color = document.getElementById('color');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const entry = {
      type: type.value,
      day: day.value,
      content: content.value,
      color: color.value
    };

    await fetch('http://localhost:3000/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });

    form.reset();
    loadEntries();
  });

  async function loadEntries() {
    document.querySelectorAll('.day-column').forEach(col => col.querySelectorAll('.entry').forEach(e => e.remove()));

    const response = await fetch('http://localhost:3000/entries');
    const entries = await response.json();

    entries.forEach(createEntryElement);
  }

  function createEntryElement(entry) {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';
    entryDiv.style.backgroundColor = entry.color || '#ccc';
    entryDiv.innerHTML = `
      <strong>${entry.type}</strong><br>${entry.content}
      <button class="delete-btn" data-id="${entry.id}">&times;</button>
    `;

    const dayCol = document.querySelector(`.day-column[data-day="${entry.day}"]`);
    if (dayCol) {
      dayCol.appendChild(entryDiv);
    }

    entryDiv.querySelector('.delete-btn').addEventListener('click', async () => {
      await fetch(`http://localhost:3000/entries/${entry.id}`, { method: 'DELETE' });
      loadEntries();
    });
  }

  loadEntries();
});
