
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const giftsFilePath = path.join(__dirname, 'gifts.json');

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
  const { name, description, link } = req.body;

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

