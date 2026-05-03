// models/Projet.js
const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,           // URL de l'image
        default: ''
    },
    technologies: [{
        type: String
    }],
    creeLe: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Projet', projetSchema);