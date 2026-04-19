// server.js
// On crée un serveur json-server personnalisé
// avec une limite de taille augmentée à 10MB
// pour accepter les images en base64

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Augmente la limite à 10MB
server.use(jsonServer.bodyParser({ limit: '10mb' }));
server.use(middlewares);
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server tourne sur http://localhost:3000');
});