// controllers/projetController.js
const Projet = require('../models/Projet');

// Récupérer tous les projets
exports.getAllProjets = async (req, res) => {
    try {
        const projets = await Projet.find().sort({ creeLe: -1 });
        res.json(projets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Récupérer un projet par ID
exports.getProjetById = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) return res.status(404).json({ message: "Projet non trouvé" });
        res.json(projet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Créer un nouveau projet
exports.createProjet = async (req, res) => {
    const projet = new Projet({
        titre: req.body.titre,
        description: req.body.description,
        image: req.body.image,
        technologies: req.body.technologies
    });

    try {
        const nouveauProjet = await projet.save();
        res.status(201).json(nouveauProjet);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Modifier un projet
exports.updateProjet = async (req, res) => {
    try {
        const projet = await Projet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!projet) return res.status(404).json({ message: "Projet non trouvé" });
        res.json(projet);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Supprimer un projet
exports.deleteProjet = async (req, res) => {
    try {
        const projet = await Projet.findByIdAndDelete(req.params.id);
        if (!projet) return res.status(404).json({ message: "Projet non trouvé" });
        res.json({ message: "Projet supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};