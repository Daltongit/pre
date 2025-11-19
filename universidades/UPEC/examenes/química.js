(async function() {
    try {
        const preguntas = await SupabaseService.getPreguntasByMateria(materiaInfo.materiaId);
        
        if (preguntas.length === 0) {
            alert('No hay preguntas disponibles para este simulador');
            window.location.href = 'simuladores.html';
            return;
        }
        
        iniciarExamen(preguntas);
        
    } catch (error) {
        console.error('Error cargando preguntas:', error);
        alert('Error al cargar las preguntas del examen');
        window.location.href = 'simuladores.html';
    }
})();
