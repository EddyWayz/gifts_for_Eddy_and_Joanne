
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const giftsFilePath = path.join(__dirname, 'gifts.json');
const suggestionsFilePath = path.join(__dirname, 'suggestions.json');

const notifyAdmin = (suggestion) => {
  console.log('New gift suggestion received:', suggestion);
};

// Endpoint to get all gifts
app.get('/api/gifts', (req, res) => {
  fs.readFile(giftsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred while reading the gifts file.');
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to reserve a gift
app.post('/api/gifts/:id/reserve', (req, res) => {
  const giftId = parseInt(req.params.id, 10);
  const { name } = req.body;

  fs.readFile(giftsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred while reading the gifts file.');
    }

    let gifts = JSON.parse(data);
    const giftIndex = gifts.findIndex(g => g.id === giftId);

    if (giftIndex === -1) {
      return res.status(404).send('Gift not found.');
    }

    if (gifts[giftIndex].reservedBy) {
      return res.status(400).send('Gift is already reserved.');
    }

    gifts[giftIndex].reservedBy = name;

    fs.writeFile(giftsFilePath, JSON.stringify(gifts, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred while saving the gifts file.');
      }
      res.json(gifts[giftIndex]);
    });
  });
});

// Endpoint to add a new gift
app.post('/api/gifts', (req, res) => {
  const { name, description, link, imageUrl, price, recipient } = req.body;

  fs.readFile(giftsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred while reading the gifts file.');
    }

    let gifts = JSON.parse(data);
    const newGift = {
      id: gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) + 1 : 1,
      name,
      description,
      link,
      imageUrl,
      price,
      recipient,
      reservedBy: null
    };

    gifts.push(newGift);

    fs.writeFile(giftsFilePath, JSON.stringify(gifts, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred while saving the gifts file.');
      }
      res.status(201).json(newGift);
    });
  });
});

// Endpoint to suggest a new gift
app.post('/api/suggestions', (req, res) => {
  const { name, description, link, imageUrl, price } = req.body;

  fs.readFile(suggestionsFilePath, 'utf8', (err, data) => {
    let suggestions = [];
    if (!err) {
      suggestions = JSON.parse(data);
    } else if (err.code !== 'ENOENT') {
      console.error(err);
      return res.status(500).send('An error occurred while reading the suggestions file.');
    }

    const newSuggestion = {
      id: suggestions.length > 0 ? Math.max(...suggestions.map(s => s.id)) + 1 : 1,
      name,
      description,
      link,
      imageUrl,
      price
    };

    suggestions.push(newSuggestion);

    fs.writeFile(suggestionsFilePath, JSON.stringify(suggestions, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred while saving the suggestions file.');
      }
      notifyAdmin(newSuggestion);
      res.status(202).json({ message: 'Suggestion received' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

