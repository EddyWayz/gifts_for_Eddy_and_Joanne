import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [gifts, setGifts] = useState([]);
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftDescription, setNewGiftDescription] = useState('');
  const [newGiftLink, setNewGiftLink] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/gifts')
      .then(res => res.json())
      .then(data => setGifts(data));
  }, []);

  const handleReserve = (id) => {
    const name = prompt('Bitte gib deinen Namen ein, um das Geschenk zu reservieren:');
    if (name) {
      fetch(`http://localhost:3001/api/gifts/${id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      .then(res => res.json())
      .then(updatedGift => {
        setGifts(gifts.map(g => g.id === id ? updatedGift : g));
      });
    }
  };

  const handleAddGift = (e) => {
    e.preventDefault();
    const newGift = { name: newGiftName, description: newGiftDescription, link: newGiftLink };
    fetch('http://localhost:3001/api/gifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGift),
    })
    .then(res => res.json())
    .then(addedGift => {
      setGifts([...gifts, addedGift]);
      setNewGiftName('');
      setNewGiftDescription('');
      setNewGiftLink('');
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Geschenke für Eddy und Joanne</h1>
      </header>
      <main>
        <div className="gift-list">
          {gifts.map(gift => (
            <div key={gift.id} className={`gift-card ${gift.reservedBy ? 'reserved' : ''}`}>
              <h2>{gift.name}</h2>
              <p>{gift.description}</p>
              {gift.link && <a href={gift.link} target="_blank" rel="noopener noreferrer">Link</a>}
              {gift.reservedBy ? (
                <p className="reserved-by">Reserviert von: {gift.reservedBy}</p>
              ) : (
                <button onClick={() => handleReserve(gift.id)}>Reservieren</button>
              )}
            </div>
          ))}
        </div>
        <div className="add-gift-form">
          <h2>Neues Geschenk hinzufügen</h2>
          <form onSubmit={handleAddGift}>
            <input
              type="text"
              placeholder="Geschenkname"
              value={newGiftName}
              onChange={(e) => setNewGiftName(e.target.value)}
              required
            />
            <textarea
              placeholder="Beschreibung"
              value={newGiftDescription}
              onChange={(e) => setNewGiftDescription(e.target.value)}
            />
            <input
              type="text"
              placeholder="Link"
              value={newGiftLink}
              onChange={(e) => setNewGiftLink(e.target.value)}
            />
            <button type="submit">Hinzufügen</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
