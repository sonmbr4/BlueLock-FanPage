

/**
 * Blue Lock - Jugadores Module
 * 
 * Módulo para gestionar la visualización y filtrado de jugadores
 * Optimizado para rendimiento y mantenibilidad
 */

// Constantes para configuración
const CONFIG = {
  selectors: {
    playerList: '#playerList',
    playerInfo: '#playerInfo',
    playerMainImage: '#playerMainImage',
    searchInput: '#searchInput',
    filterInitialRank: '#filterInitialRank',
    filterCurrentRank: '#filterCurrentRank',
    sortPlayers: '#sortPlayers',
    toggleFiltersBtn: '#toggleFiltersBtn',
    filtersContainer: '#filtersContainer',
    uniformsGrid: '#uniformsGrid'
  },
  classes: {
    active: 'active',
    hidden: 'hidden',
    animating: 'animating',
    filtersShow: 'filters-show'
  },
  animation: {
    duration: 350,
    timing: 'ease'
  },
  hexagon: {
    centerX: 160,
    centerY: 160,
    radius: 120,
    angles: [90, 30, -30, -90, -150, 150]
  }
};

// Estado de la aplicación
const AppState = {
  players: {},
  currentPlayer: null,
  filteredPlayers: []
};

// Utilidades
const Utils = {
  /**
   * Obtiene un elemento del DOM
   * @param {string} selector - Selector CSS
   * @returns {HTMLElement}
   */
  getElement: (selector) => document.querySelector(selector),

  /**
   * Obtiene todos los elementos que coinciden con el selector
   * @param {string} selector - Selector CSS
   * @returns {NodeList}
   */
  getElements: (selector) => document.querySelectorAll(selector),

  /**
   * Crea un elemento HTML
   * @param {string} tag - Nombre del tag
   * @param {Object} options - Opciones del elemento
   * @returns {HTMLElement}
   */
  createElement: (tag, options = {}) => {
    const element = document.createElement(tag);
    Object.assign(element, options);
    return element;
  }
};

// Módulo de Jugadores
const PlayersModule = {
  /**
   * Inicializa el módulo
   */
  init: async function() {
    try {
      await this.loadPlayersData();
      this.setupEventListeners();
      this.renderInitialView();
    } catch (error) {
      console.error('Error inicializando módulo de jugadores:', error);
      this.showErrorState();
    }
  },

  /**
   * Carga los datos de los jugadores
   */
  loadPlayersData: async function() {
    try {
      const response = await fetch('assets/JS/jugadores.json');
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      const data = await response.json();
      AppState.players = data.jugadores;
      AppState.filteredPlayers = Object.keys(AppState.players);
    } catch (error) {
      console.error('Error cargando datos de jugadores:', error);
      throw error;
    }
  },

  /**
   * Configura los event listeners
   */
  setupEventListeners: function() {
    const {
      searchInput,
      filterInitialRank,
      filterCurrentRank,
      sortPlayers,
      toggleFiltersBtn
    } = CONFIG.selectors;

    // Eventos de filtrado
    Utils.getElement(searchInput).addEventListener('input', () => this.filterPlayers());
    Utils.getElement(filterInitialRank).addEventListener('change', () => this.filterPlayers());
    Utils.getElement(filterCurrentRank).addEventListener('change', () => this.filterPlayers());
    Utils.getElement(sortPlayers).addEventListener('change', (e) => {
      this.renderFilteredPlayers(this.sortPlayers(e.target.value));
    });

    // Mostrar/ocultar filtros
    Utils.getElement(toggleFiltersBtn).addEventListener('click', () => this.toggleFilters());
  },

  /**
   * Renderiza la vista inicial
   */
  renderInitialView: function() {
    this.renderPlayerList();
    if (AppState.filteredPlayers.length > 0) {
      this.loadPlayer(AppState.filteredPlayers[0]);
    }
  },

  /**
   * Muestra estado de error
   */
  showErrorState: function() {
    Utils.getElement(CONFIG.selectors.playerList).innerHTML = `
      <div class="error-state p-3 text-center text-white">
        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
        <p>Error al cargar los datos de los jugadores</p>
      </div>
    `;
  },

  /**
   * Renderiza la lista de jugadores
   */
  renderPlayerList: function() {
    const playerList = Utils.getElement(CONFIG.selectors.playerList);
    playerList.innerHTML = '';

    if (AppState.filteredPlayers.length === 0) {
      playerList.innerHTML = '<div class="text-white p-3">No se encontraron jugadores.</div>';
      return;
    }

    AppState.filteredPlayers.forEach((playerId, index) => {
      const player = AppState.players[playerId];
      const playerItem = this.createPlayerElement(playerId, player, index === 0);
      playerList.appendChild(playerItem);
    });
  },

  /**
   * Crea un elemento de jugador para la lista
   */
  createPlayerElement: function(playerId, player, isActive = false) {
    const playerItem = Utils.createElement('div', {
      className: `player-item ${isActive ? CONFIG.classes.active : ''}`,
      innerHTML: `
        <img src="${player.icon}" alt="${player.name}" class="player-icon">
        <span>${player.name.split(' ')[0]}</span>
      `
    });

    playerItem.addEventListener('click', () => {
      Utils.getElements('.player-item').forEach(item => {
        item.classList.remove(CONFIG.classes.active);
      });
      playerItem.classList.add(CONFIG.classes.active);
      this.loadPlayer(playerId);
    });

    return playerItem;
  },

  /**
   * Alterna la visibilidad de los filtros
   */
  toggleFilters: function() {
    const filtersContainer = Utils.getElement(CONFIG.selectors.filtersContainer);
    const isHidden = filtersContainer.style.display === 'none';
    
    filtersContainer.style.display = isHidden ? 'block' : 'none';
    filtersContainer.classList.toggle(CONFIG.classes.filtersShow, isHidden);
    
    const btn = Utils.getElement(CONFIG.selectors.toggleFiltersBtn);
    btn.innerHTML = isHidden
      ? '<i class="fas fa-times me-2"></i> Ocultar Filtros'
      : '<i class="fas fa-filter me-2"></i> Mostrar Filtros';
  },

  /**
   * Filtra los jugadores según los criterios seleccionados
   */
  filterPlayers: function() {
    const searchTerm = Utils.getElement(CONFIG.selectors.searchInput).value.toLowerCase();
    const initialRankFilter = Utils.getElement(CONFIG.selectors.filterInitialRank).value;
    const currentRankFilter = Utils.getElement(CONFIG.selectors.filterCurrentRank).value;

    AppState.filteredPlayers = Object.keys(AppState.players).filter(playerId => {
      const player = AppState.players[playerId];
      return (
        player.name.toLowerCase().includes(searchTerm) &&
        this.checkInitialRankFilter(player, initialRankFilter) &&
        this.checkCurrentRankFilter(player, currentRankFilter)
      );
    });

    this.renderFilteredPlayers(AppState.filteredPlayers);
  },

  /**
   * Comprueba si un jugador cumple con el filtro de ranking inicial
   */
  checkInitialRankFilter: function(player, filter) {
    switch (filter) {
      case "top100": return player.rankingInicial <= 100;
      case "200-300": return player.rankingInicial >= 200 && player.rankingInicial <= 300;
      case "descalificado": return player.rankingActual === "Descalificado";
      default: return true;
    }
  },

  /**
   * Comprueba si un jugador cumple con el filtro de ranking actual
   */
  checkCurrentRankFilter: function(player, filter) {
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
  },

  /**
   * Renderiza la lista de jugadores filtrados
   */
  renderFilteredPlayers: function(filteredPlayerIds) {
    AppState.filteredPlayers = filteredPlayerIds;
    this.renderPlayerList();
    
    if (filteredPlayerIds.length > 0) {
      this.loadPlayer(filteredPlayerIds[0]);
    }
  },

  /**
   * Ordena los jugadores según el criterio seleccionado
   */
  sortPlayers: function(sortBy) {
    return [...AppState.filteredPlayers].sort((a, b) => {
      const playerA = AppState.players[a];
      const playerB = AppState.players[b];
      
      switch (sortBy) {
        case "initial_rank":
          return playerA.rankingInicial - playerB.rankingInicial;
          
        case "current_rank":
          const rankA = typeof playerA.rankingActual === 'number' ? playerA.rankingActual : Infinity;
          const rankB = typeof playerB.rankingActual === 'number' ? playerB.rankingActual : Infinity;
          return rankA - rankB;
          
        default:
          return 0;
      }
    });
  },

  /**
   * Carga y muestra la información de un jugador
   */
  loadPlayer: function(playerId) {
    const player = AppState.players[playerId];
    if (!player) return;

    AppState.currentPlayer = playerId;
    this.animatePlayerTransition(() => {
      this.updatePlayerImage(player.image);
      this.updatePlayerInfo(player);
      this.updateHexagonChart(player.stats);
    });
  },

  /**
   * Ejecuta la animación de transición al cambiar de jugador
   */
  animatePlayerTransition: function(callback) {
    const playerImage = Utils.getElement(CONFIG.selectors.playerMainImage);
    const imageContainer = Utils.getElement('.player-image-section');

    playerImage.classList.add(CONFIG.classes.hidden);
    imageContainer.classList.add(CONFIG.classes.animating);

    setTimeout(() => {
      callback();
      playerImage.classList.remove(CONFIG.classes.hidden);
      imageContainer.classList.remove(CONFIG.classes.animating);
    }, CONFIG.animation.duration);
  },

  /**
   * Actualiza la imagen del jugador
   */
  updatePlayerImage: function(imageSrc) {
    Utils.getElement(CONFIG.selectors.playerMainImage).src = imageSrc;
  },

  /**
   * Actualiza la información del jugador
   */
  updatePlayerInfo: function(player) {
    const playerInfo = Utils.getElement(CONFIG.selectors.playerInfo);
    playerInfo.innerHTML = this.generatePlayerInfoHTML(player);
    this.updateUniforms(player);
  },

  /**
   * Genera el HTML para la información del jugador
   */
  generatePlayerInfoHTML: function(player) {
    return `
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
          ${this.createStatItem('VELOCIDAD', player.stats.Velocidad)}
          ${this.createStatItem('OFENSIVA', player.stats.ofensiva)}
          ${this.createStatItem('DEFENSIVA', player.stats.defensa)}
        </div>
        <div class="col-md-6">
          ${this.createStatItem('TIRO', player.stats.tiro)}
          ${this.createStatItem('PASE', player.stats.pase)}
          ${this.createStatItem('DRIBBLE', player.stats.dribble)}
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
    
      <!-- Uniformes -->
      <div class="uniforms-section mt-4" id="uniformsContainer">
        <h4 class="mb-3" style="font-family: 'Bebas Neue'; color: #0a2e52;">
          <i class="fas fa-tshirt me-2"></i> UNIFORMES
        </h4>
        <div class="uniforms-grid" id="uniformsGrid"></div>
      </div>
    `;
  },

  /**
   * Crea un elemento de estadística
   */
  createStatItem: function(name, value) {
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
  },

  /**
   * Actualiza el gráfico hexagonal de estadísticas
   */
  updateHexagonChart: function(stats) {
    const hexStats = Utils.getElement('#hexStats');
    hexStats.innerHTML = '';

    const { centerX, centerY, radius, angles } = CONFIG.hexagon;
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
      const dot = Utils.createElement('div', {
        className: 'stat-point',
        style: `left: ${x}px; top: ${y}px;`
      });
      hexStats.appendChild(dot);

      const line = Utils.createElement('div', {
        className: 'stat-line',
        style: `
          left: ${centerX}px;
          top: ${centerY}px;
          width: ${effectiveRadius}px;
          transform: rotate(${-angle}deg);
        `
      });
      hexStats.appendChild(line);
    });

    hexStats.style.clipPath = `polygon(${points.join(',')})`;
  },

  /**
   * Actualiza la sección de uniformes
   */
  updateUniforms: function(player) {
    const uniformsGrid = Utils.getElement(CONFIG.selectors.uniformsGrid);
    uniformsGrid.innerHTML = '';

    if (!player.uniforms || player.uniforms.length === 0) {
      uniformsGrid.innerHTML = '<p class="text-muted">No hay uniformes disponibles para este jugador.</p>';
      return;
    }

    // Añadir la imagen principal como primera opción
    const mainImageCard = this.createUniformCard({
      image: player.image,
      type: 'Vista Principal',
      isActive: true,
      onClick: () => this.resetMainImage(player)
    });
    uniformsGrid.appendChild(mainImageCard);

    // Añadir los uniformes alternativos
    player.uniforms.forEach(uniform => {
      const uniformCard = this.createUniformCard({
        image: uniform.image,
        type: uniform.type,
        onClick: () => {
          this.changePlayerImage(uniform.image);
          this.setActiveUniformCard(uniformCard);
        }
      });
      uniformsGrid.appendChild(uniformCard);
    });
  },

  /**
   * Crea una tarjeta de uniforme
   */
  createUniformCard: function({ image, type, isActive = false, onClick }) {
    const uniformCard = Utils.createElement('div', {
      className: `uniform-card ${isActive ? 'active' : ''}`,
      innerHTML: `
        <img src="${image}" alt="Uniforme ${type}" loading="lazy">
        <p>${type}</p>
      `
    });

    uniformCard.addEventListener('click', onClick);
    return uniformCard;
  },

  /**
   * Cambia la imagen del jugador
   */
  changePlayerImage: function(newImageSrc) {
    this.animatePlayerTransition(() => {
      this.updatePlayerImage(newImageSrc);
    });
  },

  /**
   * Establece la tarjeta de uniforme activa
   */
  setActiveUniformCard: function(card) {
    Utils.getElements('.uniform-card').forEach(c => {
      c.classList.remove('active');
    });
    card.classList.add('active');
  },

  /**
   * Restablece la imagen principal del jugador
   */
  resetMainImage: function(player) {
    this.changePlayerImage(player.image);
    const firstCard = Utils.getElements('.uniform-card')[0];
    if (firstCard) this.setActiveUniformCard(firstCard);
  }
};

// Inicializar el módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => PlayersModule.init());