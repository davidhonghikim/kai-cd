// This mock server simulates API calls for the Creator RPG UI
// Run this with Node.js using express or a mock service

const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

let wallet = {
  act: 12473,
  rep: 103,
  cards: 6,
};

let origin = {
  tribe: "Quantum Grove",
  system: "Aetheris Prime",
};

// GET Wallet
app.get('/api/wallet', (req, res) => {
  res.json(wallet);
});

// POST Stash Earnings
app.post('/api/wallet/stash', (req, res) => {
  const reward = Math.floor(Math.random() * 300) + 200;
  wallet.act += reward;
  res.json({ reward, newBalance: wallet.act });
});

// PUT Tribe/System update
app.put('/api/origin', (req, res) => {
  const { tribe, system } = req.body;
  origin.tribe = tribe;
  origin.system = system;
  res.json(origin);
});

// GET Origin Info
app.get('/api/origin', (req, res) => {
  res.json(origin);
});

app.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}`));
