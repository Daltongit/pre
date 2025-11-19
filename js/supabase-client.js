const supabaseClient = supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key
);

const SupabaseService = {
    async getUniversidades() {
        const { data, error } = await supabaseClient
            .from('universidades')
            .select('*')
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        return data;
    },

    async getMateriasByUniversidad(universidadId) {
        const { data, error } = await supabaseClient
            .from('materias')
            .select('*')
            .eq('universidad_id', universidadId)
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        return data;
    },

    async getPreguntasByMateria(materiaId) {
        const { data, error } = await supabaseClient
            .from('preguntas')
            .select('*')
            .eq('materia_id', materiaId)
            .eq('activo', true);
        
        if (error) throw error;
        return data;
    },

    async guardarIntento(intentoData) {
        const { data, error } = await supabaseClient
            .from('intentos')
            .insert([intentoData])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async guardarRespuestasDetalle(respuestas) {
        const { data, error } = await supabaseClient
            .from('respuestas_detalle')
            .insert(respuestas);
        
        if (error) throw error;
        return data;
    },

    async getIntentosByUsuario(usuario) {
        const { data, error } = await supabaseClient
            .from('vista_reportes_intentos')
            .select('*')
            .eq('usuario', usuario)
            .order('fecha_inicio', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async getAllIntentos() {
        const { data, error } = await supabaseClient
            .from('vista_reportes_intentos')
            .select('*')
            .order('fecha_inicio', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async getDetalleIntento(intentoId) {
        const { data, error } = await supabaseClient
            .from('respuestas_detalle')
            .select('*')
            .eq('intento_id', intentoId)
            .order('orden_pregunta');
        
        if (error) throw error;
        return data;
    },

    async getIntentoCompleto(intentoId) {
        const { data, error } = await supabaseClient
            .from('intentos')
            .select(`
                *,
                materias (
                    nombre,
                    universidades (
                        nombre,
                        codigo
                    )
                )
            `)
            .eq('id', intentoId)
            .single();
        
        if (error) throw error;
        return data;
    }
};
