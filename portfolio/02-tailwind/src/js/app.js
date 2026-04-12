// =============================================
// app.js - JavaScript du Portfolio
// Mairam Baidy Sow - Groupe 1 AWS re/Start
// Module JavaScript - Version 2
// =============================================

console.log("%c🚀 app.js chargé avec succès !", "color: #1e40af; font-weight: bold;");

// =============================================
// 1. DONNÉES : Tableau qui contient tous les projets
// =============================================
let projets = [
    {
        id: 1,
        titre: "Application de gestion des étudiants",
        description: "Application web complète avec gestion des utilisateurs et base de données SQL Server.",
        image: "./assets/images/etudiant-app.png",
        technologies: ["HTML", "CSS", "JavaScript", "SQL Server"]
    },
    {
        id: 2,
        titre: "Déploiement AWS EC2",
        description: "Mise en place d’un serveur web Apache sur instance EC2.",
        image: "./assets/images/aws-ec2.png",
        technologies: ["AWS", "EC2", "Apache", "Linux"]
    },
    {
        id: 3,
        titre: "CI/CD avec GitHub Actions",
        description: "Automatisation complète du déploiement avec pipeline CI/CD.",
        image: "./assets/images/github-actions.png",
        technologies: ["GitHub Actions", "AWS", "Docker", "DevOps"]
    }
];

console.log(`📊 ${projets.length} projets chargés dans la mémoire`);