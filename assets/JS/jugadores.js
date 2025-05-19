// Objeto global para almacenar los jugadores
const playersData = {
  players: {},
  currentPlayer: null
};

// Constantes para selectores y clases
const SELECTORS = {
  playerList: '#playerList',
  playerInfo: '#playerInfo',
  playerMainImage: '#playerMainImage',
  searchInput: '#searchInput',
  filterInitialRank: '#filterInitialRank',
  filterCurrentRank: '#filterCurrentRank',
  sortPlayers: '#sortPlayers',
  toggleFiltersBtn: '#toggleFiltersBtn',
  filtersContainer: '#filtersContainer'
};

const CLASSES = {
  active: 'active',
  hidden: 'hidden',
  animating: 'animating'
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayersData();
  setupEventListeners();
});

// Cargar datos de los jugadores
async function loadPlayersData() {
  try {
    const response = await fetch('assets/JS/jugadores.json');
    const data = await response.json();
    playersData.players = data.jugadores;
    initPlayerList();
  } catch (error) {
    console.error('Error cargando datos de jugadores:', error);
    // Aquí podrías cargar datos de respaldo si es necesario
  }
}

// Inicializar lista de jugadores
function initPlayerList() {
  const playerList = document.querySelector(SELECTORS.playerList);
  playerList.innerHTML = '';

  const playerIds = Object.keys(playersData.players);
  if (playerIds.length === 0) return;

  playerIds.forEach((playerId, index) => {
    const player = playersData.players[playerId];
    const playerItem = createPlayerElement(playerId, player, index === 0);
    playerList.appendChild(playerItem);
  });

  // Cargar primer jugador
  loadPlayer(playerIds[0]);
}

// Crear elemento de jugador
function createPlayerElement(playerId, player, isActive = false) {
  const playerItem = document.createElement('div');
  playerItem.className = `player-item ${isActive ? CLASSES.active : ''}`;
  playerItem.innerHTML = `
    <img src="${player.icon}" alt="${player.name}" class="player-icon">
    <span>${player.name.split(' ')[0]}</span>
  `;

  playerItem.addEventListener('click', () => {
    document.querySelectorAll('.player-item').forEach(item => {
      item.classList.remove(CLASSES.active);
    });
    playerItem.classList.add(CLASSES.active);
    loadPlayer(playerId);
  });

  return playerItem;
}

// Configurar event listeners
function setupEventListeners() {
  // Filtros y búsqueda
  document.querySelector(SELECTORS.searchInput).addEventListener('input', filterPlayers);
  document.querySelector(SELECTORS.filterInitialRank).addEventListener('change', filterPlayers);
  document.querySelector(SELECTORS.filterCurrentRank).addEventListener('change', filterPlayers);
  document.querySelector(SELECTORS.sortPlayers).addEventListener('change', function() {
    renderFilteredPlayers(sortPlayers(this.value));
  });

  // Mostrar/ocultar filtros
  document.querySelector(SELECTORS.toggleFiltersBtn).addEventListener('click', toggleFilters);
}

// Alternar visibilidad de filtros
function toggleFilters() {
  const filtersContainer = document.querySelector(SELECTORS.filtersContainer);
  const isHidden = filtersContainer.style.display === 'none';

  filtersContainer.style.display = isHidden ? 'block' : 'none';
  filtersContainer.classList.toggle('filters-show', isHidden);

  this.innerHTML = isHidden
    ? '<i class="fas fa-times me-2"></i> Ocultar Filtros'
    : '<i class="fas fa-filter me-2"></i> Mostrar Filtros';
}

// Filtrar jugadores
function filterPlayers() {
  const searchTerm = document.querySelector(SELECTORS.searchInput).value.toLowerCase() || '';
  const initialRankFilter = document.querySelector(SELECTORS.filterInitialRank).value;
  const currentRankFilter = document.querySelector(SELECTORS.filterCurrentRank).value;

  const filteredPlayers = Object.keys(playersData.players).filter(playerId => {
    const player = playersData.players[playerId];
    const nameMatch = player.name.toLowerCase().includes(searchTerm);

    // Filtro por ranking inicial
    const initialRankMatch = checkInitialRankFilter(player, initialRankFilter);
    
    // Filtro por ranking actual
    const currentRankMatch = checkCurrentRankFilter(player, currentRankFilter);

    return nameMatch && initialRankMatch && currentRankMatch;
  });

  renderFilteredPlayers(filteredPlayers);
}

// Comprobar filtro de ranking inicial
function checkInitialRankFilter(player, filter) {
  switch (filter) {
    case "top100": return player.rankingInicial <= 100;
    case "200-300": return player.rankingInicial >= 200 && player.rankingInicial <= 300;
    case "descalificado": return player.rankingActual === "Descalificado";
    default: return true;
  }
}

// Comprobar filtro de ranking actual
function checkCurrentRankFilter(player, filter) {
  if (filter === "all") return true;
  
  if (typeof player.rankingActual === 'number') {
    switch (filter) {
      case "top10": return player.rankingActual <= 10;
      case "top50": return player.rankingActual <= 50;
      default: return false;
    }
  } else {
    switch (filter) {
      case "descalificado": return player.rankingActual === "Descalificado";
      case "whiteCard": return player.rankingActual === "Wild Card";
      default: return false;
    }
  }
}

// Renderizar jugadores filtrados
function renderFilteredPlayers(filteredPlayerIds) {
  const playerList = document.querySelector(SELECTORS.playerList);
  playerList.innerHTML = '';

  if (filteredPlayerIds.length === 0) {
    playerList.innerHTML = '<div class="text-white p-3">No se encontraron jugadores.</div>';
    return;
  }

  filteredPlayerIds.forEach((playerId, index) => {
    const player = playersData.players[playerId];
    const playerItem = createPlayerElement(playerId, player, index === 0);
    playerList.appendChild(playerItem);
  });

  // Cargar el primer jugador de la lista filtrada
  if (filteredPlayerIds.length > 0) {
    loadPlayer(filteredPlayerIds[0]);
  }
}

// Ordenar jugadores
function sortPlayers(sortBy) {
  const playerIds = Object.keys(playersData.players);

  switch (sortBy) {
    case "initial_rank":
      return playerIds.sort((a, b) => 
        playersData.players[a].rankingInicial - playersData.players[b].rankingInicial);

    case "current_rank":
      return playerIds.sort((a, b) => {
        const rankA = typeof playersData.players[a].rankingActual === 'number' ? 
          playersData.players[a].rankingActual : Infinity;
        const rankB = typeof playersData.players[b].rankingActual === 'number' ? 
          playersData.players[b].rankingActual : Infinity;
        return rankA - rankB;
      });

    default:
      return playerIds;
  }
}

// Cargar jugador seleccionado
function loadPlayer(playerId) {
  const player = playersData.players[playerId];
  playersData.currentPlayer = playerId;
  
  const imageContainer = document.querySelector('.player-image-section');
  const playerImage = document.querySelector(SELECTORS.playerMainImage);

  // Animación de transición
  playerImage.classList.add(CLASSES.hidden);
  imageContainer.classList.add(CLASSES.animating);

  setTimeout(() => {
    playerImage.src = player.image;
    playerImage.classList.remove(CLASSES.hidden);
    
    // Forzar reflow para reiniciar la animación
    void playerImage.offsetWidth;
    imageContainer.classList.remove(CLASSES.animating);
    void imageContainer.offsetWidth;

    updatePlayerInfo(player);
    updateHexagonChart(player.stats);
  }, 350);
}

// Actualizar información del jugador
function updatePlayerInfo(player) {
  document.querySelector(SELECTORS.playerInfo).innerHTML = `
    <h1 class="main-title">${player.name}</h1>
    <p class="lead text-muted mb-4">${player.position}</p>

    <div class="stat-card mt-4">
      <h4 class="mb-3">Ranking Inicial:</h4>
      <div class="d-flex flex-wrap">
        <h1 class="main-title">${player.rankingInicial}</h1>
      </div>

      <h4 class="mb-3">Ranking Actual:</h4>
      <div class="d-flex flex-wrap">
        <h1 class="main-title">${player.rankingActual}</h1>
      </div>
    </div>

    <!-- Gráfico hexagonal -->
    <div class="hexagon-container">
      <div class="hexagon-grid"></div>
      <div class="hexagon-stats" id="hexStats"></div>
      <div class="stat-labels">
        <div class="stat-label label-speed">VELOCIDAD</div>
        <div class="stat-label label-stamina">OFENSIVA</div>
        <div class="stat-label label-offense">DEFENSA</div>
        <div class="stat-label label-pass">TIRO</div>
        <div class="stat-label label-defense">PASE</div>
        <div class="stat-label label-shoot">DRIBBLE</div>
      </div>
    </div>
    
    <!-- Estadísticas detalladas -->
    <div class="row">
      <div class="col-md-6">
        ${createStatItem('VELOCIDAD', player.stats.Velocidad)}
        ${createStatItem('OFENSIVA', player.stats.ofensiva)}
        ${createStatItem('DEFENSIVA', player.stats.defensa)}
      </div>
      <div class="col-md-6">
        ${createStatItem('TIRO', player.stats.tiro)}
        ${createStatItem('PASE', player.stats.pase)}
        ${createStatItem('DRIBBLE', player.stats.dribble)}
      </div>
    </div>
    
    <!-- Habilidades -->
    <div class="stat-card mt-4">
      <h4 class="mb-3" style="font-family: 'Bebas Neue', sans-serif; color: #0a2e52;">
        <i class="fas fa-futbol me-2"></i> HABILIDADES ESPECIALES
      </h4>
      <div class="skills-container">
        ${player.skills.map(skill => `
          <div class="skill-item">
            <span class="skill-name">${skill}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Nota de Ego -->
    <div class="stat-card mt-3">
      <div class="ego-note">
        <h4 class="mb-3" style="color: #0a2e52;">NOTA DE JINPACHI EGO</h4>
        <p class="mb-3 fst-italic" style="font-size: 0.95rem;">
          "${player.egoNote || 'Este jugador aún no ha demostrado si merece ser el egoísta definitivo.'}"
        </p>
      </div>
    </div>
  `;
}

// Crear elemento de estadística
function createStatItem(name, value) {
  return `
    <div class="stat-detail-item mb-3">
      <div class="d-flex justify-content-between">
        <span class="stat-name">${name}</span>
        <span class="stat-value">${value}</span>
      </div>
      <div class="progress" style="height: 8px;">
        <div class="progress-bar bg-primary" style="width: ${value}%"></div>
      </div>
    </div>
  `;
}

// Actualizar gráfico hexagonal
function updateHexagonChart(stats) {
  const hexStats = document.getElementById('hexStats');
  hexStats.innerHTML = '';

  const centerX = 160;
  const centerY = 160;
  const radius = 120;
  const angles = [90, 30, -30, -90, -150, 150];
  const points = [];

  angles.forEach((angle, index) => {
    const statKey = Object.keys(stats)[index];
    const statValue = stats[statKey];
    const effectiveRadius = radius * (statValue / 100);

    const radian = angle * Math.PI / 180;
    const x = centerX + effectiveRadius * Math.cos(radian);
    const y = centerY - effectiveRadius * Math.sin(radian);

    points.push(`${x}px ${y}px`);

    // Puntos y líneas
    const dot = document.createElement('div');
    dot.className = 'stat-point';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    hexStats.appendChild(dot);

    const line = document.createElement('div');
    line.className = 'stat-line';
    line.style.left = `${centerX}px`;
    line.style.top = `${centerY}px`;
    line.style.width = `${effectiveRadius}px`;
    line.style.transform = `rotate(${-angle}deg)`;
    hexStats.appendChild(line);
  });

  hexStats.style.clipPath = `polygon(${points.join(',')})`;
}