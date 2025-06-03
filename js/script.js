let poissonsData = [];
let quantites = {};  // objet pour stocker quantités par nom de poisson
let isDouble = false; // pour suivre l'état de la checkbox

// Fonction pour formater les nombres avec des espaces
function formaterNombre(nombre) {
  return nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function chargerPoissons() {
  const response = await fetch('poissons.json');
  poissonsData = await response.json();
  afficherPoissons();
}

function afficherPoissons() {
  const container = document.getElementById('poissons');
  container.innerHTML = '';

  // Ajouter la checkbox x2
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'mb-4 flex items-center justify-end';
  checkboxContainer.innerHTML = `
    <label class="flex items-center space-x-2 cursor-pointer">
      <input type="checkbox" id="multiplier" class="form-checkbox h-5 w-5 text-peche-accent rounded border-peche-medium focus:ring-peche-accent">
      <span class="text-peche-dark font-medium">x2</span>
    </label>
  `;
  container.appendChild(checkboxContainer);

  // Ajouter l'écouteur d'événement pour la checkbox
  const checkbox = checkboxContainer.querySelector('#multiplier');
  checkbox.addEventListener('change', (e) => {
    isDouble = e.target.checked;
    initialiserCalculs();
  });

  // Grouper les poissons par rareté
  const poissonsParRarete = poissonsData.reduce((acc, poisson) => {
    if (!acc[poisson.rarete]) {
      acc[poisson.rarete] = [];
    }
    acc[poisson.rarete].push(poisson);
    return acc;
  }, {});

  // Créer un bloc pour chaque rareté
  Object.entries(poissonsParRarete).forEach(([rarete, poissons]) => {
    const sectionRarete = document.createElement('div');
    sectionRarete.className = 'mb-8';
    
    const header = document.createElement('div');
    header.className = 'bg-peche-medium text-white p-4 rounded-t-lg shadow-md';
    header.innerHTML = `<h2 class="text-xl font-bold">${rarete}</h2>`;
    sectionRarete.appendChild(header);

    const poissonsContainer = document.createElement('div');
    poissonsContainer.className = 'bg-white rounded-b-lg shadow-lg p-6';
    
    // Créer une grille horizontale pour les poissons
    const poissonsGrid = document.createElement('div');
    poissonsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';

    poissons.forEach(poisson => {
      const div = document.createElement('div');
      div.className = 'poisson bg-white p-4 rounded-lg border border-peche-light hover:shadow-md transition-shadow duration-200';

      const qte = quantites[poisson.nom] || 0;

      div.innerHTML = `
        <div class="flex flex-col h-full">
          <!-- Nom du poisson avec hauteur fixe et retour à la ligne -->
          <div class="h-12 flex items-start">
            <span class="text-lg font-semibold text-peche-dark line-clamp-2">${poisson.nom}</span>
          </div>

          <!-- Prix avec hauteur fixe -->
          <div class="h-8 flex items-center">
            <span class="text-peche-accent">$${formaterNombre(poisson.prix)}</span>
          </div>

          <!-- Input avec hauteur fixe -->
          <div class="h-10 flex items-center">
            <input type="number" min="0" value="${qte}" 
                   data-prix="${poisson.prix}" 
                   data-nom="${poisson.nom}" 
                   class="quantite w-20 px-2 py-1 border border-peche-medium rounded focus:outline-none focus:ring-2 focus:ring-peche-accent">
          </div>

          <!-- Total avec hauteur fixe -->
          <div class="h-8 flex items-center justify-end mt-2">
            <span class="text-peche-dark font-medium">Total : <span class="prix-total">$0</span></span>
          </div>
        </div>
      `;

      poissonsGrid.appendChild(div);
    });

    poissonsContainer.appendChild(poissonsGrid);
    sectionRarete.appendChild(poissonsContainer);
    container.appendChild(sectionRarete);
  });

  initialiserCalculs();
}

function initialiserCalculs() {
  const inputs = document.querySelectorAll('.quantite');
  const prixGeneral = document.getElementById('prix-general');

  function calculer() {
    let totalGeneral = 0;
    inputs.forEach(input => {
      const prix = parseFloat(input.dataset.prix);
      const quantite = parseInt(input.value) || 0;
      const nom = input.dataset.nom;

      // Mettre à jour la quantité sauvegardée
      quantites[nom] = quantite;

      const total = prix * quantite * (isDouble ? 2 : 1);
      totalGeneral += total;

      input.closest('.poisson').querySelector('.prix-total').textContent = `$${formaterNombre(total)}`;
    });
    prixGeneral.textContent = `$${formaterNombre(totalGeneral)}`;
  }

  inputs.forEach(input => input.addEventListener('input', calculer));
  calculer();
}

chargerPoissons();
