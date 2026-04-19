// services/projetService.js
// Ce fichier gère toute la communication avec json-server
// Avantage : si l'URL change, on modifie UNE seule fois ici

import axios from 'axios';

const API_URL = 'http://localhost:3000/projets';

// Récupérer tous les projets
export const getProjets = () => axios.get(API_URL);

// Récupérer un seul projet par son ID
export const getProjet = (id) => axios.get(`${API_URL}/${id}`);

// Ajouter un nouveau projet
export const ajouterProjet = (projet) => axios.post(API_URL, projet);

// Modifier un projet existant
export const modifierProjet = (id, projet) => axios.put(`${API_URL}/${id}`, projet);

// Supprimer un projet
export const supprimerProjet = (id) => axios.delete(`${API_URL}/${id}`);