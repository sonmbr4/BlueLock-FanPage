/**
 * Blue Lock - Equipos Module
 * Módulo para gestionar la visualización de equipos
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('assets/JS/equipos.json');
    const data = await response.json();
    const equipos = data.equipos;
    
    // Cargar lista de equipos
    const equipoList = document.getElementById('equipoList');
    Object.keys(equipos).forEach(equipoId => {
      const equipo = equipos[equipoId];
      const equipoItem = document.createElement('div');
      equipoItem.className = 'equipo-item';
      equipoItem.innerHTML = equipo.nombre;
      equipoItem.addEventListener('click', () => cargarEquipo(equipoId));
      equipoList.appendChild(equipoItem);
    });

    // Cargar primer equipo por defecto
    if (Object.keys(equipos).length > 0) {
      cargarEquipo(Object.keys(equipos)[0]);
    }
  } catch (error) {
    console.error('Error cargando equipos:', error);
  }
});

async function cargarEquipo(equipoId) {
  const response = await fetch('assets/JS/equipos.json');
  const data = await response.json();
  const equipo = data.equipos[equipoId];
  const jugadoresData = await fetch('assets/JS/jugadores.json').then(res => res.json());

  // Actualizar título
  document.querySelector('.team-title').textContent = equipo.nombre;

  // Actualizar formación
  const formationField = document.querySelector('.formation-field');
  formationField.innerHTML = '';
  
  equipo.jugadores.forEach(jugador => {
    const playerData = jugadoresData.jugadores[jugador.id];
    if (playerData) {
      const playerContainer = document.createElement('div');
      playerContainer.className = `player-container ${jugador.posicion}`;
      playerContainer.innerHTML = `
        <div class="player"><img src="${playerData.icon}" alt="${playerData.name}"></div>
        <div class="player-name">${playerData.name.split(' ')[0]}</div>
      `;
      formationField.appendChild(playerContainer);
    }
  });

  // Actualizar estadísticas
  document.getElementById('teamStats').innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Formación:</span>
      <span class="stat-value">${equipo.formacion}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Victorias:</span>
      <span class="stat-value">${equipo.partidosGanados}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Derrotas:</span>
      <span class="stat-value">${equipo.partidosPerdidos}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Goles:</span>
      <span class="stat-value">${equipo.golesAnotados}</span>
    </div>
  `;

  // Actualizar jugador destacado
  const featuredPlayer = document.querySelector('.featured-player');
  featuredPlayer.innerHTML = `
    <img src="${equipo.jugadorDestacado.imagen}" alt="${equipo.jugadorDestacado.nombre}">
    <h4>${equipo.jugadorDestacado.nombre}</h4>
    <p>${equipo.jugadorDestacado.goles} goles</p>
  `;
}