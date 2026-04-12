// =============================================
// app.js - Version rapide et fonctionnelle
// Mairam Baidy Sow - Portfolio Interactif
// =============================================

console.log("%c app.js chargé avec succès !", "color: #1e40af; font-weight: bold;");

// Charger les projets depuis le stockage (localStorage)
let projets = JSON.parse(localStorage.getItem("projets")) || [
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
        description: "Mise en place d'un serveur web Apache sur instance EC2.",
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

// =============================================
// SAUVEGARDER dans localStorage
// =============================================
function sauvegarderProjets() {
    localStorage.setItem("projets", JSON.stringify(projets));
}

// =============================================
// AJOUTER un projet
// =============================================
function ajouterProjet(titre, description, imageBase64, technologies) {
    const nouveauProjet = {
        id: Date.now(),
        titre: titre,
        description: description,
        image: imageBase64 || "./assets/images/default.png",
        technologies: technologies ? technologies.split(",").map(t => t.trim()) : []
    };
    projets.unshift(nouveauProjet);
    sauvegarderProjets();
    console.log(" Projet ajouté :", nouveauProjet.titre);
}

// =============================================
// SUPPRIMER un projet
// =============================================
function supprimerProjet(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    projets = projets.filter(p => p.id !== id);
    sauvegarderProjets();
    afficherProjets(); // Rafraîchit la liste après suppression
    console.log(" Projet supprimé, id :", id);
}

// =============================================
// AFFICHER la liste des projets
// =============================================
function afficherProjets() {
    const container = document.getElementById("projets-container");
    if (!container) return;

    container.innerHTML = "";

    projets.forEach(projet => {
        const cardHTML = `
            <div class="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition group">
                <img src="${projet.image}" 
                     onerror="this.src='https://placehold.co/400x200/1e40af/white?text=Projet'"
                     class="w-full h-56 object-cover group-hover:scale-105 transition">
                <div class="p-8">
                    <h3 class="text-2xl font-semibold text-slate-800 mb-2">${projet.titre}</h3>
                    <p class="text-slate-600 mb-6">${projet.description}</p>
                    <div class="flex items-center justify-between">
                        <a href="detailler-projet.html?id=${projet.id}" 
                           class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                            Voir le détail <i class="fas fa-arrow-right"></i>
                        </a>
                        <button onclick="supprimerProjet(${projet.id})"
                                class="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// =============================================
// AFFICHER le détail d'un projet
// =============================================
function afficherDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));
    const projet = projets.find(p => p.id === id);

    const container = document.getElementById("detail-container");
    if (!container) return;

    if (!projet) {
        container.innerHTML = `
            <p class="text-red-500 text-xl"> Projet introuvable.</p>
            <a href="lister-projets.html" class="text-blue-600 mt-4 inline-block">← Retour à la liste</a>
        `;
        return;
    }

    container.innerHTML = `
        <h1 class="text-4xl font-bold text-slate-800 mb-2">${projet.titre}</h1>
        <p class="text-blue-600 font-medium mb-8">Mairam Baidy Sow - Groupe 1 AWS re/Start</p>

        <div class="rounded-3xl overflow-hidden shadow-xl mb-10">
            <img src="${projet.image}" 
                 onerror="this.src='https://placehold.co/800x400/1e40af/white?text=${projet.titre}'"
                 alt="${projet.titre}" class="w-full">
        </div>

        <p class="text-lg text-slate-700 mb-8">${projet.description}</p>

        <h2 class="text-2xl font-semibold text-slate-800 mb-4">Technologies utilisées</h2>
        <ol class="list-decimal pl-6 space-y-2 text-slate-700 mb-10">
            ${projet.technologies.map(tech => `<li>${tech}</li>`).join("")}
        </ol>

        <div class="flex gap-4">
            <a href="lister-projets.html" 
               class="flex-1 bg-white border border-slate-300 text-slate-700 py-4 rounded-2xl text-center font-medium hover:bg-slate-50">
                ← Retour à la liste
            </a>
            <button onclick="supprimerProjet(${projet.id}); window.location.href='lister-projets.html'"
                    class="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl text-center font-medium">
                <i class="fas fa-trash"></i> Supprimer ce projet
            </button>
        </div>
    `;
}

// =============================================
// DOMContentLoaded — point d'entrée principal
// =============================================
document.addEventListener("DOMContentLoaded", () => {

    // Page liste des projets
    if (document.getElementById("projets-container")) {
        afficherProjets();
    }

    // Page détail d'un projet
    if (document.getElementById("detail-container")) {
        afficherDetail();
    }

    // Page formulaire d'ajout
    const form = document.getElementById("form-ajouter-projet");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();

            const titre        = document.getElementById("titre").value.trim();
            const description  = document.getElementById("description").value.trim();
            const technologies = document.getElementById("technologies").value.trim();
            const imageFile    = document.getElementById("imageFile").files[0];

            if (!titre || !description) {
                alert(" Le titre et la description sont obligatoires !");
                return;
            }

            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    ajouterProjet(titre, description, event.target.result, technologies);
                    form.reset();
                    alert(" Projet ajouté avec succès !");
                    window.location.href = "lister-projets.html";
                };
                reader.readAsDataURL(imageFile);
            } else {
                ajouterProjet(titre, description, null, technologies);
                form.reset();
                alert(" Projet ajouté avec succès !");
                window.location.href = "lister-projets.html";
            }
        });
    }
});