
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const giftsFilePath = path.join(__dirname, 'gifts.json');
const suggestionsFilePath = path.join(__dirname, 'suggestions.json');

const notifyAdmin = (suggestion) => {
  console.log('New gift suggestion received:', suggestion);
};

// Endpoint to get all gifts
app.get('/api/gifts', async (req, res) => {
  try {
    const data = await fs.readFile(giftsFilePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while reading the gifts file.');
  }
});

// Endpoint to reserve a gift
app.post('/api/gifts/:id/reserve', async (req, res) => {
  const giftId = parseInt(req.params.id, 10);
  const { name } = req.body;

  try {
    const data = await fs.readFile(giftsFilePath, 'utf8');
    let gifts = JSON.parse(data);
    const giftIndex = gifts.findIndex(g => g.id === giftId);

    if (giftIndex === -1) {
      return res.status(404).send('Gift not found.');
    }

    if (gifts[giftIndex].reservedBy) {
      return res.status(400).send('Gift is already reserved.');
    }

    gifts[giftIndex].reservedBy = name;

    await fs.writeFile(giftsFilePath, JSON.stringify(gifts, null, 2));
    res.json(gifts[giftIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while processing the request.');
  }
});

// Endpoint to add a new gift
app.post('/api/gifts', async (req, res) => {
  const { name, description, link, imageUrl, price, recipient } = req.body;

  try {
    const data = await fs.readFile(giftsFilePath, 'utf8');
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
    await fs.writeFile(giftsFilePath, JSON.stringify(gifts, null, 2));
    res.status(201).json(newGift);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while processing the gifts file.');
  }
});

// Endpoint to suggest a new gift
app.post('/api/suggestions', async (req, res) => {
  const { name, description, link, imageUrl, price } = req.body;

  let suggestions = [];
  try {
    const data = await fs.readFile(suggestionsFilePath, 'utf8');
    suggestions = JSON.parse(data);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
      return res.status(500).send('An error occurred while reading the suggestions file.');
    }
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

  try {
    await fs.writeFile(suggestionsFilePath, JSON.stringify(suggestions, null, 2));
    notifyAdmin(newSuggestion);
    res.status(202).json({ message: 'Suggestion received' });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while saving the suggestions file.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

