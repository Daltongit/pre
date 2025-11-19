class AuthSystem {
    constructor() {
        this.currentUser = null;
    }

    async cargarUsuarios() {
        try {
            const response = await fetch('../data/usuarios.json');
            const data = await response.json();
            return data.usuarios;
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            return [];
        }
    }

    async login(usuario, contrasena) {
        const usuarios = await this.cargarUsuarios();
        const user = usuarios.find(u => 
            u.usuario === usuario && u.contrasena === contrasena
        );

        if (user) {
            this.currentUser = {
                usuario: user.usuario,
                rol: user.rol,
                nombreCompleto: user.nombre_completo
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = '../login.html';
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        return this.currentUser;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.rol === 'admin';
    }

    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '../login.html';
        }
    }
}

const authSystem = new AuthSystem();
