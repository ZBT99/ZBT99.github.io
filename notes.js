(() => {
  const script = document.currentScript;
  if (!script) return;
  const root = new URL('./', script.src);
  const targets = document.querySelectorAll('[data-notes-list]');
  if (!targets.length) return;
  const resolveNote = (note) => {
    if (!note || typeof note.title !== 'string' || !note.title.trim()
      || typeof note.file !== 'string' || !note.file.trim()) return null;
    try {
      const url = new URL(note.file, root);
      if (!['https:', 'http:'].includes(url.protocol)) return null;
      return { ...note, url };
    } catch { return null; }
  };
  const createItem = (note) => {
    const item = document.createElement('li');
    item.className = 'note-item';
    const heading = document.createElement('h3');
    const link = document.createElement('a');
    link.href = note.url.href;
    link.textContent = note.title;
    if (note.url.pathname.toLowerCase().endsWith('.pdf')) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
    heading.append(link);
    item.append(heading);
    return item;
  };
  fetch(new URL('notes/notes.json', root), { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Notes unavailable');
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('Invalid notes index');
      const notes = data.map(resolveNote).filter(Boolean)
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      if (!notes.length) return;
      targets.forEach(target => {
        const limit = Number(target.dataset.notesLimit);
        const entries = limit > 0 ? notes.slice(0, limit) : notes;
        const list = document.createElement('ul');
        list.className = 'note-list';
        entries.forEach(note => list.append(createItem(note)));
        target.replaceChildren(list);
      });
    })
    .catch(() => {
      targets.forEach(target => {
        if (target.querySelector('.note-list')) return;
        const message = document.createElement('p');
        message.className = 'notes-empty';
        message.textContent = 'The notes list is temporarily unavailable. Please try again later.';
        target.replaceChildren(message);
      });
    });
})();
