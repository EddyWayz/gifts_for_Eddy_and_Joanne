import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [gifts, setGifts] = useState([]);
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftDescription, setNewGiftDescription] = useState('');
  const [newGiftLink, setNewGiftLink] = useState('');
  const [newGiftImageUrl, setNewGiftImageUrl] = useState('');
  const [newGiftPrice, setNewGiftPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc', 'desc'
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [newGiftRecipient, setNewGiftRecipient] = useState('eddy');
  const [suggestionMessage, setSuggestionMessage] = useState('');


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

  const handleSuggestGift = (e) => {
    e.preventDefault();
    const newGift = {
      name: newGiftName,
      description: newGiftDescription,
      link: newGiftLink,
      imageUrl: newGiftImageUrl,
      price: parseFloat(newGiftPrice),
      recipient: newGiftRecipient,
    };
    fetch('http://localhost:3001/api/gifts', {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGift),
    })
    .then(() => {
      setSuggestionMessage('Danke für deinen Vorschlag!');
      setNewGiftName('');
      setNewGiftDescription('');
      setNewGiftLink('');
      setNewGiftImageUrl('');
      setNewGiftPrice('');
      setNewGiftRecipient('eddy');
    });

  };

  const filteredGifts = gifts.filter(gift => {
    if (recipientFilter === 'all') return true;
    return gift.recipient === recipientFilter;
  });

  const sortedGifts = [...filteredGifts].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.price - b.price;
    } else if (sortOrder === 'desc') {
      return b.price - a.price;
    } else {
      return 0;
    }
  });

  const getPriceMarker = (price) => {
    if (price < 50) {
      return '$';
    } else if (price >= 50 && price < 200) {
      return '$$';
    } else {
      return '$$$';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Geschenke für Eddy und Joanne</h1>
      </header>
      <main>
          <div className="gift-list">
            <div className="filter-controls">
              <button className={recipientFilter === 'all' ? 'active' : ''} onClick={() => setRecipientFilter('all')}>Alle</button>
              <button className={recipientFilter === 'eddy' ? 'active' : ''} onClick={() => setRecipientFilter('eddy')}>Eddy</button>
              <button className={recipientFilter === 'joanne' ? 'active' : ''} onClick={() => setRecipientFilter('joanne')}>Joanne</button>
              <button className={recipientFilter === 'both' ? 'active' : ''} onClick={() => setRecipientFilter('both')}>Beide</button>

            </div>
            <div className="sort-controls">
              <button className={sortOrder === 'none' ? 'active' : ''} onClick={() => setSortOrder('none')}>Keine Sortierung</button>
              <button className={sortOrder === 'asc' ? 'active' : ''} onClick={() => setSortOrder('asc')}>Preis aufsteigend</button>
              <button className={sortOrder === 'desc' ? 'active' : ''} onClick={() => setSortOrder('desc')}>Preis absteigend</button>
            </div>
            {sortedGifts.map(gift => (
              <div key={gift.id} className={`gift-card ${gift.reservedBy ? 'reserved' : ''}`}>
                <h2>{gift.name}</h2>
                {gift.imageUrl && <img src={gift.imageUrl} alt={gift.name} />}
                <p>{gift.description}</p>
                <p className="recipient">Für: {gift.recipient === 'both' ? 'Eddy & Joanne' : gift.recipient === 'eddy' ? 'Eddy' : 'Joanne'}</p>
                {gift.price && <p>Preis: {gift.price} {getPriceMarker(gift.price)}</p>}
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
          <h2>Geschenk vorschlagen</h2>
          {suggestionMessage && <p>{suggestionMessage}</p>}
          <form onSubmit={handleSuggestGift}>
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
          <input
            type="text"
            placeholder="Bild-URL"
            value={newGiftImageUrl}
            onChange={(e) => setNewGiftImageUrl(e.target.value)}
          />
          <select
            value={newGiftRecipient}
            onChange={(e) => setNewGiftRecipient(e.target.value)}
          >
            <option value="eddy">Für Eddy</option>
            <option value="joanne">Für Joanne</option>
            <option value="both">Für Beide</option>
          </select>
          <input
            type="number"
            placeholder="Preis"
            value={newGiftPrice}
            onChange={(e) => setNewGiftPrice(e.target.value)}
          />
            <button type="submit">Hinzufügen</button>

          </form>
        </div>
      </main>
    </div>
  );
}

export default App;

