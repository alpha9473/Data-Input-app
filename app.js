const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;
const MONGO_URL = 'mongodb://localhost:27017'; // Change to your Atlas string if needed
const DB_NAME = 'dafu';
const COLLECTION = 'places';

app.use(cors());
app.use(bodyParser.json());

let db, places;

// Connect to MongoDB
MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(DB_NAME);
    places = db.collection(COLLECTION);
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Add a new place
app.post('/api/places', async (req, res) => {
  try {
    const { name, address, latitude, longitude, phone, hours, features } = req.body;
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const doc = {
      name,
      address,
      coordinates: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      phone,
      hours,
      features: Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : [])
    };
    await places.insertOne(doc);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add place' });
  }
});

// Get places by category (feature)
app.get('/api/places', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query = { features: { $regex: new RegExp(category, 'i') } };
    }
    const results = await places.find(query).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch places' });
  }
}); 