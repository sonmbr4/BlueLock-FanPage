document.addEventListener('DOMContentLoaded', function() {
    const creatorCards = document.querySelectorAll('.creator-card');
    const descriptionSection = document.getElementById('creator-description');
    
    creatorCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remover clase activa de todas las tarjetas
            creatorCards.forEach(c => c.classList.remove('active'));
            
            // Marcar tarjeta clickeada como activa
            this.classList.add('active');
            
            // Mostrar sección de descripción
            descriptionSection.style.display = 'block';
            
            // Ocultar todos los contenidos y mostrar el correspondiente
            document.querySelectorAll('.creator-content').forEach(content => {
                content.style.display = 'none';
            });
            
            const creator = this.getAttribute('data-creator');
            document.getElementById(`${creator}-content`).style.display = 'block';
        });
    });
});