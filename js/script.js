let poissonsData = [];
let quantites = {};  // objet pour stocker quantités par nom de poisson
let isDouble = false; // pour suivre l'état de la checkbox

// Gestion du mode sombre
function initialiserModeSombre() {
  // Vérifier si le mode sombre est activé dans le localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // Appliquer le mode sombre si nécessaire
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  }

  // Ajouter l'écouteur d'événement pour le bouton de basculement
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    // Sauvegarder la préférence
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  });
}

// Initialiser le mode sombre au chargement
initialiserModeSombre();

// Fonction pour sauvegarder les quantités dans le localStorage
function sauvegarderQuantites() {
  localStorage.setItem('quantites', JSON.stringify(quantites));
  localStorage.setItem('isDouble', JSON.stringify(isDouble));
}

// Fonction pour charger les quantités depuis le localStorage
function chargerQuantites() {
  const quantitesSauvegardees = localStorage.getItem('quantites');
  const isDoubleSauvegarde = localStorage.getItem('isDouble');
  
  if (quantitesSauvegardees) {
    quantites = JSON.parse(quantitesSauvegardees);
  }
  
  if (isDoubleSauvegarde) {
    isDouble = JSON.parse(isDoubleSauvegarde);
  }
}

// Fonction pour formater les nombres avec des espaces
function formaterNombre(nombre) {
  return nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function chargerPoissons() {
  const response = await fetch('poissons.json');
  poissonsData = await response.json();
  afficherPoissons();
}

function resetQuantites() {
  quantites = {};
  isDouble = false;
  localStorage.removeItem('quantites');
  localStorage.removeItem('isDouble');
  afficherPoissons();
}

function afficherPoissons() {
  const container = document.getElementById('poissons');
  container.innerHTML = '';

  // Ajouter la checkbox x2 et le bouton reset
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'mb-4 flex items-center justify-end space-x-4';
  controlsContainer.innerHTML = `
    <label class="flex items-center space-x-2 cursor-pointer group">
      <input type="checkbox" id="multiplier" class="form-checkbox h-5 w-5 text-peche-accent rounded border-peche-medium focus:ring-peche-accent transition-transform duration-300 group-hover:scale-110" ${isDouble ? 'checked' : ''}>
      <span class="text-peche-dark dark:text-peche-light font-medium group-hover:text-peche-accent transition-colors duration-300">x2</span>
    </label>
    <button id="reset" class="px-4 py-2 bg-peche-medium dark:bg-gray-700 text-white rounded-lg hover:bg-peche-dark dark:hover:bg-gray-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
      Reset
    </button>
  `;
  container.appendChild(controlsContainer);

  // Ajouter l'écouteur d'événement pour la checkbox
  const checkbox = controlsContainer.querySelector('#multiplier');
  checkbox.addEventListener('change', (e) => {
    isDouble = e.target.checked;
    sauvegarderQuantites();
    initialiserCalculs();
  });

  // Ajouter l'écouteur d'événement pour le bouton reset
  const resetButton = controlsContainer.querySelector('#reset');
  resetButton.addEventListener('click', resetQuantites);

  // Grouper les poissons par rareté
  const poissonsParRarete = poissonsData.reduce((acc, poisson) => {
    if (!acc[poisson.rarete]) {
      acc[poisson.rarete] = [];
    }
    acc[poisson.rarete].push(poisson);
    return acc;
  }, {});

  // Créer un bloc pour chaque rareté
  Object.entries(poissonsParRarete).forEach(([rarete, poissons], index) => {
    const sectionRarete = document.createElement('div');
    sectionRarete.className = 'mb-8 transform transition-all duration-500 hover:scale-[1.02]';
    sectionRarete.style.animationDelay = `${index * 100}ms`;
    
    const header = document.createElement('div');
    header.className = 'bg-peche-medium dark:bg-gray-700 text-white p-4 rounded-t-lg shadow-md transform transition-all duration-300 hover:shadow-lg';
    header.innerHTML = `<h2 class="text-xl font-bold">${rarete}</h2>`;
    sectionRarete.appendChild(header);

    const poissonsContainer = document.createElement('div');
    poissonsContainer.className = 'bg-white dark:bg-gray-800 rounded-b-lg shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl';
    
    // Créer une grille horizontale pour les poissons
    const poissonsGrid = document.createElement('div');
    poissonsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';

    poissons.forEach((poisson, poissonIndex) => {
      const div = document.createElement('div');
      div.className = 'poisson bg-white dark:bg-gray-800 p-4 rounded-lg border border-peche-light dark:border-gray-700 hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1';
      div.style.animationDelay = `${(index * 100) + (poissonIndex * 50)}ms`;

      const qte = quantites[poisson.nom] || 0;

      div.innerHTML = `
        <div class="flex flex-col h-full">
          <!-- Nom du poisson avec hauteur fixe et retour à la ligne -->
          <div class="h-12 flex items-start">
            <span class="text-lg font-semibold text-peche-dark dark:text-peche-light line-clamp-2 transition-colors duration-300 group-hover:text-peche-accent">${poisson.nom}</span>
          </div>

          <!-- Prix avec hauteur fixe -->
          <div class="h-8 flex items-center">
            <span class="text-peche-accent transition-all duration-300 group-hover:scale-110">$${formaterNombre(poisson.prix)}</span>
          </div>

          <!-- Input avec hauteur fixe -->
          <div class="h-10 flex items-center">
            <input type="number" min="0" value="${qte}" 
                   data-prix="${poisson.prix}" 
                   data-nom="${poisson.nom}" 
                   class="quantite w-20 px-2 py-1 border border-peche-medium dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-peche-accent bg-white dark:bg-gray-700 text-peche-dark dark:text-peche-light transition-all duration-300 hover:border-peche-accent focus:scale-105">
          </div>

          <!-- Total avec hauteur fixe -->
          <div class="h-8 flex items-center justify-end mt-2">
            <span class="text-peche-dark dark:text-peche-light font-medium transition-colors duration-300">Total : <span class="prix-total transition-all duration-300">$0</span></span>
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
      
      // Sauvegarder les quantités après chaque modification
      sauvegarderQuantites();

      const total = prix * quantite * (isDouble ? 2 : 1);
      totalGeneral += total;

      input.closest('.poisson').querySelector('.prix-total').textContent = `$${formaterNombre(total)}`;
    });
    prixGeneral.textContent = `$${formaterNombre(totalGeneral)}`;
  }

  inputs.forEach(input => input.addEventListener('input', calculer));
  calculer();
}

// Charger les données sauvegardées au démarrage
chargerQuantites();
chargerPoissons();
