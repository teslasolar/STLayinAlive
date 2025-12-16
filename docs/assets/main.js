/**
 * Main JavaScript for STLayinAlive Gallery
 */

// Model catalog data
const modelCatalog = [
  {
    id: 'mounting-bracket',
    name: 'Mounting Bracket',
    category: 'brackets',
    description: 'Parametric mounting bracket with configurable holes',
    icon: '🔩',
    stlFile: '../dist/mounting-bracket.stl',
    params: {
      width: '50mm',
      height: '30mm',
      holes: 2
    }
  },
  {
    id: 'konomi-enclosure',
    name: 'Konomi Enclosure',
    category: 'konomiParts',
    description: 'Electronics enclosure with ventilation',
    icon: '📦',
    stlFile: '../dist/konomi-enclosure.stl',
    params: {
      width: '100mm',
      depth: '80mm',
      height: '40mm'
    }
  },
  {
    id: 'cable-clip',
    name: 'Cable Clip',
    category: 'accessories',
    description: 'Parametric cable management clip',
    icon: '📎',
    stlFile: '../dist/cable-clip.stl',
    params: {
      diameter: '6mm',
      height: '10mm'
    }
  }
];

// Current filter
let currentFilter = 'all';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderModels();
  setupFilters();
  setupSmoothScroll();
});

/**
 * Render model cards
 */
function renderModels() {
  const grid = document.getElementById('model-grid');
  grid.innerHTML = '';

  const filteredModels = currentFilter === 'all' 
    ? modelCatalog 
    : modelCatalog.filter(m => m.category === currentFilter);

  filteredModels.forEach(model => {
    const card = createModelCard(model);
    grid.appendChild(card);
  });
}

/**
 * Create a model card element
 */
function createModelCard(model) {
  const card = document.createElement('div');
  card.className = 'model-card';
  card.dataset.category = model.category;

  const paramsText = Object.entries(model.params)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' • ');

  card.innerHTML = `
    <div class="model-preview">
      ${model.icon}
    </div>
    <div class="model-info">
      <h3>${model.name}</h3>
      <span class="model-category">${formatCategory(model.category)}</span>
      <p>${model.description}</p>
      <div class="model-params">${paramsText}</div>
      <div class="model-actions">
        <button class="btn btn-primary btn-small" onclick="viewModel('${model.id}')">
          View 3D
        </button>
        <button class="btn btn-secondary btn-small" onclick="downloadSTL('${model.stlFile}', '${model.id}')">
          Download STL
        </button>
      </div>
    </div>
  `;

  return card;
}

/**
 * Format category name
 */
function formatCategory(category) {
  const map = {
    'brackets': 'Brackets',
    'konomiParts': 'Konomi Parts',
    'accessories': 'Accessories'
  };
  return map[category] || category;
}

/**
 * Setup filter buttons
 */
function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update filter and re-render
      currentFilter = btn.dataset.category;
      renderModels();
    });
  });
}

/**
 * Setup smooth scrolling
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * View model in 3D viewer
 */
window.viewModel = function(modelId) {
  const model = modelCatalog.find(m => m.id === modelId);
  if (model) {
    window.location.href = `viewer.html?model=${modelId}`;
  }
};

/**
 * Download STL file
 */
window.downloadSTL = function(stlFile, modelId) {
  // Check if file exists first
  fetch(stlFile, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        // File exists, download it
        const link = document.createElement('a');
        link.href = stlFile;
        link.download = `${modelId}.stl`;
        link.click();
      } else {
        alert(`STL file not yet generated. Run 'npm run build' to generate all STL files.`);
      }
    })
    .catch(() => {
      alert(`STL file not yet generated. Run 'npm run build' to generate all STL files.`);
    });
};

/**
 * Export for use in other scripts
 */
export { modelCatalog };
