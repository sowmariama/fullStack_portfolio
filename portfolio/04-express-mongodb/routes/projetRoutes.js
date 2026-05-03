// routes/projetRoutes.js
const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projetController');

// Routes CRUD
router.get('/', projetController.getAllProjets);           // Liste tous les projets
router.get('/:id', projetController.getProjetById);        // Détail d'un projet
router.post('/', projetController.createProjet);           // Ajouter un projet
router.put('/:id', projetController.updateProjet);         // Modifier un projet
router.delete('/:id', projetController.deleteProjet);      // Supprimer un projet

module.exports = router;