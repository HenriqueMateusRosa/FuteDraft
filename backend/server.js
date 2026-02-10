
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/sort-teams', (req, res) => {
  const players = req.body.players || [];
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const mid = Math.ceil(shuffled.length / 2);
  res.json({
    teamA: shuffled.slice(0, mid),
    teamB: shuffled.slice(mid)
  });
});

app.listen(3001, () => console.log('Backend running on port 3001'));
