(async function() {
    const UPEC_SIMULADORES = [
        {
            id: 'upec-matematica',
            nombre: 'Matemática',
            descripcion: 'Álgebra, geometría, trigonometría y cálculo',
            icono: '📐',
            scriptExamen: '../universidades/UPEC/examenes/matematica.js',
            materiaId: null
        },
        {
            id: 'upec-fisica',
            nombre: 'Física',
            descripcion: 'Mecánica, termodinámica y electromagnetismo',
            icono: '⚛️',
            scriptExamen: '../universidades/UPEC/examenes/fisica.js',
            materiaId: null
        },
        {
            id: 'upec-quimica',
            nombre: 'Química',
            descripcion: 'Química general, orgánica e inorgánica',
            icono: '🧪',
            scriptExamen: '../universidades/UPEC/examenes/quimica.js',
            materiaId: null
        }
    ];

    const universidadData = JSON.parse(localStorage.getItem('universidadSeleccionada'));
    const materias = await SupabaseService.getMateriasByUniversidad(universidadData.id);
    
    UPEC_SIMULADORES.forEach(sim => {
        const materia = materias.find(m => m.codigo.toLowerCase() === sim.nombre.toLowerCase());
        if (materia) {
            sim.materiaId = materia.id;
        }
    });

    const grid = document.getElementById('simuladoresGrid');
    
    if (UPEC_SIMULADORES.filter(s => s.materiaId).length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No hay simuladores disponibles para esta universidad</p>';
        return;
    }
    
    grid.innerHTML = UPEC_SIMULADORES
        .filter(sim => sim.materiaId)
        .map(sim => `
            <div class="simulador-card" onclick="abrirModal({
                id: '${sim.id}',
                nombre: '${sim.nombre}',
                materiaId: ${sim.materiaId},
                scriptExamen: '${sim.scriptExamen}',
                universidadCodigo: 'UPEC'
            })">
                <div class="simulador-icon">${sim.icono}</div>
                <h3 class="simulador-nombre">${sim.nombre}</h3>
                <p class="simulador-descripcion">${sim.descripcion}</p>
            </div>
        `).join('');
})();
