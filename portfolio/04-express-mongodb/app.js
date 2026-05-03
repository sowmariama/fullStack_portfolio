// app.js - Point d'entrée de l'API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Import des routes
const projetRoutes = require('./routes/projetRoutes');

// Utilisation des routes
app.use('/api/projets', projetRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send('API Portfolio - Mairam Baidy Sow est en ligne !');
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => {
        console.error('Erreur connexion MongoDB :', err.message);
        process.exit(1);
    });

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});