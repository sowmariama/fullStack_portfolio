// app.js - Point d'entrée de l'API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();   // Charge les variables d'environnement (.env)

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());   // Pour lire les données JSON dans req.body

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => console.error('Erreur connexion MongoDB :', err));

// Routes (on les importera plus tard)
app.get('/', (req, res) => {
    res.send('API Portfolio - Mairam Baidy Sow est en ligne !');
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});