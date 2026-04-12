// =============================================
// app.js - Mairam Baidy Sow - Portfolio
// Avec json-server pour la persistance
// =============================================

const API_URL = "http://localhost:3000/projets";

console.log("%c app.js chargé avec succès !", "color: #1e40af; font-weight: bold;");

// =============================================
// AFFICHER la liste des projets
// =============================================
async function afficherProjets() {
    const container = document.getElementById("projets-container");
    if (!container) return;

    try {
        const response = await fetch(API_URL);
        const projets = await response.json();

        container.innerHTML = "";

        projets.forEach(projet => {
            container.innerHTML += `
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
        });
    } catch (error) {
        console.error("Erreur chargement projets :", error);
    }
}

// =============================================
// AFFICHER le détail d'un projet
// =============================================
async function afficherDetail() {
    const container = document.getElementById("detail-container");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const projet = await response.json();

        if (!projet) {
            container.innerHTML = `<p class="text-red-500">Projet introuvable.</p>`;
            return;
        }

        container.innerHTML = `
            <h1 class="text-4xl font-bold text-slate-800 mb-2">${projet.titre}</h1>
            <p class="text-blue-600 font-medium mb-8">Mairam Baidy Sow - Groupe 1 AWS re/Start</p>

            <div class="rounded-3xl overflow-hidden shadow-xl mb-10">
                <img src="${projet.image}" 
                     onerror="this.src='https://placehold.co/800x400/1e40af/white?text=Projet'"
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
                <button onclick="supprimerProjet(${projet.id})"
                        class="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-medium">
                    <i class="fas fa-trash"></i> Supprimer ce projet
                </button>
            </div>
        `;
    } catch (error) {
        console.error("Erreur chargement détail :", error);
    }
}

// =============================================
// AJOUTER un projet
// =============================================
async function ajouterProjet(titre, description, imageBase64, technologies) {
    const nouveauProjet = {
        titre: titre,
        description: description,
        image: imageBase64 || "https://placehold.co/400x200/1e40af/white?text=Projet",
        technologies: technologies ? technologies.split(",").map(t => t.trim()) : []
    };

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nouveauProjet)
    });

    const projetCree = await response.json();
    console.log(" Projet ajouté :", projetCree.titre);
    return projetCree;
}

// =============================================
// SUPPRIMER un projet
// =============================================
async function supprimerProjet(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        console.log(" Projet supprimé, id :", id);

        if (document.getElementById("detail-container")) {
            window.location.href = "lister-projets.html";
        } else {
            afficherProjets();
        }
    } catch (error) {
        console.error("Erreur suppression :", error);
    }
}

// =============================================
// DOMContentLoaded
// =============================================
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("projets-container")) {
        afficherProjets();
    }

    if (document.getElementById("detail-container")) {
        afficherDetail();
    }

    const form = document.getElementById("form-ajouter-projet");
    if (form) {
        form.addEventListener("submit", async function(e) {
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
                reader.onload = async function(event) {
                    await ajouterProjet(titre, description, event.target.result, technologies);
                    form.reset();
                    window.location.href = "lister-projets.html";
                };
                reader.readAsDataURL(imageFile);
            } else {
                await ajouterProjet(titre, description, null, technologies);
                form.reset();
                window.location.href = "lister-projets.html";
            }
        });
    }
});