authSystem.checkAuth();

if (!authSystem.isAdmin()) {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = 'universidades.html';
}

let todosLosReportes = [];

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = authSystem.getCurrentUser();
    document.getElementById('userName').textContent = currentUser.nombreCompleto;
    
    await cargarReportes();
    
    document.getElementById('btnVolver').addEventListener('click', () => {
        window.location.href = 'universidades.html';
    });
    
    document.getElementById('btnLogout').addEventListener('click', () => {
        authSystem.logout();
    });
    
    document.getElementById('filtroUsuario').addEventListener('input', filtrarReportes);
    document.getElementById('btnDescargarTodos').addEventListener('click', descargarTodosPDF);
});

async function cargarReportes() {
    try {
        todosLosReportes = await SupabaseService.getAllIntentos();
        mostrarReportes(todosLosReportes);
    } catch (error) {
        console.error('Error cargando reportes:', error);
        alert('Error al cargar los reportes');
    }
}

function mostrarReportes(reportes) {
    const container = document.getElementById('reportesContainer');
    
    if (reportes.length === 0) {
        container.innerHTML = '<div class="no-reportes">No hay reportes disponibles</div>';
        return;
    }
    
    container.innerHTML = reportes.map(reporte => `
        <div class="reporte-card">
            <div class="reporte-header">
                <div class="reporte-usuario">👤 ${reporte.usuario}</div>
                <div class="reporte-puntaje">${reporte.puntaje_obtenido}/1000</div>
            </div>
            
            <div class="reporte-info">
                <div class="reporte-item">
                    <span class="reporte-label">Universidad:</span>
                    <span class="reporte-valor">${reporte.universidad}</span>
                </div>
                <div class="reporte-item">
                    <span class="reporte-label">Materia:</span>
                    <span class="reporte-valor">${reporte.materia}</span>
                </div>
                <div class="reporte-item">
                    <span class="reporte-label">Fecha:</span>
                    <span class="reporte-valor">${formatearFecha(reporte.fecha_inicio)}</span>
                </div>
                <div class="reporte-item">
                    <span class="reporte-label">Duración:</span>
                    <span class="reporte-valor">${reporte.duracion_minutos} min</span>
                </div>
                <div class="reporte-item">
                    <span class="reporte-label">Correctas:</span>
                    <span class="reporte-valor" style="color: #4caf50;">${reporte.preguntas_correctas}</span>
                </div>
                <div class="reporte-item">
                    <span class="reporte-label">Incorrectas:</span>
                    <span class="reporte-valor" style="color: #f44336;">${reporte.preguntas_incorrectas}</span>
                </div>
                <div class="reporte-item">
                    <span class="reporte-label">En Blanco:</span>
                    <span class="reporte-valor" style="color: #ff9800;">${reporte.preguntas_blanco}</span>
                </div>
                <div class="reporte-item">
                    <span class="reporte-label">Total Preguntas:</span>
                    <span class="reporte-valor">${reporte.total_preguntas}</span>
                </div>
            </div>
            
            <div class="reporte-acciones">
                <button class="btn-pdf" onclick="descargarPDFIndividual(${reporte.id}, '${reporte.usuario}')">
                    📄 Descargar PDF Individual
                </button>
            </div>
        </div>
    `).join('');
}

function filtrarReportes() {
    const filtro = document.getElementById('filtroUsuario').value.toLowerCase();
    const reportesFiltrados = todosLosReportes.filter(r => 
        r.usuario.toLowerCase().includes(filtro)
    );
    mostrarReportes(reportesFiltrados);
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
}

async function descargarPDFIndividual(intentoId, usuario) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const intento = await SupabaseService.getIntentoCompleto(intentoId);
        const detalle = await SupabaseService.getDetalleIntento(intentoId);
        
        // Encabezado
        doc.setFillColor(211, 47, 47);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('SPARTA ACADEMY', 105, 15, { align: 'center' });
        
        doc.setFontSize(14);
        doc.text('Reporte de Simulador', 105, 25, { align: 'center' });
        
        // Información del estudiante
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        let yPos = 50;
        
        doc.setFont(undefined, 'bold');
        doc.text('Información del Estudiante', 20, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Usuario: ${usuario}`, 20, yPos);
        yPos += 7;
        doc.text(`Universidad: ${intento.materias.universidades.nombre}`, 20, yPos);
        yPos += 7;
        doc.text(`Materia: ${intento.materias.nombre}`, 20, yPos);
        yPos += 7;
        doc.text(`Fecha: ${formatearFecha(intento.fecha_inicio)}`, 20, yPos);
        yPos += 7;
        doc.text(`Duración: ${intento.duracion_minutos} minutos`, 20, yPos);
        yPos += 12;
        
        // Resultados
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.text('Resultados', 20, yPos);
        yPos += 8;
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        // Puntaje destacado
        doc.setFillColor(201, 169, 97);
        doc.rect(20, yPos, 170, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text(`PUNTAJE: ${intento.puntaje_obtenido} / 1000`, 105, yPos + 10, { align: 'center' });
        yPos += 22;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        
        // Estadísticas
        const tableData = [
            ['Total de Preguntas', intento.total_preguntas.toString()],
            ['Respuestas Correctas', intento.preguntas_correctas.toString()],
            ['Respuestas Incorrectas', intento.preguntas_incorrectas.toString()],
            ['Dejadas en Blanco', intento.preguntas_blanco.toString()]
        ];
        
        doc.autoTable({
            startY: yPos,
            head: [['Estadística', 'Cantidad']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [211, 47, 47] },
            margin: { left: 20, right: 20 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
        
        // Detalle de respuestas
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.text('Detalle de Respuestas', 20, yPos);
        yPos += 10;
        
        const detalleData = detalle.map(d => {
            const estado = d.respuesta_estudiante === null ? 'En Blanco' : 
                          (d.es_correcta ? 'Correcta' : 'Incorrecta');
            const tuRespuesta = d.respuesta_estudiante || '-';
            return [
                d.orden_pregunta.toString(),
                estado,
                d.respuesta_correcta,
                tuRespuesta
            ];
        });
        
        doc.autoTable({
            startY: yPos,
            head: [['#', 'Estado', 'Correcta', 'Tu Respuesta']],
            body: detalleData,
            theme: 'grid',
            headStyles: { fillColor: [201, 169, 97] },
            margin: { left: 20, right: 20 },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 50 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 }
            }
        });
        
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`, 105, 290, { align: 'center' });
        }
        
        doc.save(`Reporte_${usuario}_${intento.materias.nombre}_${Date.now()}.pdf`);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el PDF');
    }
}

async function descargarTodosPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFillColor(211, 47, 47);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('SPARTA ACADEMY', 105, 15, { align: 'center' });
        
        doc.setFontSize(14);
        doc.text('Reporte General de Aspirantes', 105, 25, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`, 105, 35, { align: 'center' });
        
        // Tabla de todos los reportes
        const tableData = todosLosReportes.map(r => [
            r.usuario,
            r.universidad,
            r.materia,
            formatearFecha(r.fecha_inicio),
            `${r.puntaje_obtenido}/1000`,
            `${r.preguntas_correctas}/${r.total_preguntas}`,
            r.duracion_minutos.toString()
        ]);
        
        doc.autoTable({
            startY: 50,
            head: [['Usuario', 'Universidad', 'Materia', 'Fecha', 'Puntaje', 'Correctas', 'Duración']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [211, 47, 47], fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            margin: { left: 10, right: 10 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 35 },
                2: { cellWidth: 30 },
                3: { cellWidth: 35 },
                4: { cellWidth: 22 },
                5: { cellWidth: 20 },
                6: { cellWidth: 18 }
            }
        });
        
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        }
        
        doc.save(`Reporte_General_Aspirantes_${Date.now()}.pdf`);
        
    } catch (error) {
        console.error('Error generando PDF general:', error);
        alert('Error al generar el PDF general');
    }
}
