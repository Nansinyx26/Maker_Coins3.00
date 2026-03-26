// Auto-detect API URL based on environment
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

const apiClient = {
    async register(userData) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro no registro');
        return data;
    },

    async login(email, senha) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro no login');
        return data;
    },

    async getMe() {
        const token = localStorage.getItem('makerToken');
        if (!token) throw new Error('Não autenticado');

        const response = await fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao buscar perfil');
        return data;
    },

    async getHistory() {
        const token = localStorage.getItem('makerToken');
        if (!token) throw new Error('Não autenticado');

        const response = await fetch(`${API_URL}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao buscar histórico');
        return data;
    },

    async getRanking(turma) {
        const token = localStorage.getItem('makerToken');
        if (!token) throw new Error('Não autenticado');

        const response = await fetch(`${API_URL}/ranking/${turma}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao buscar ranking');
        return data;
    },

    async redeemAward(award) {
        const token = localStorage.getItem('makerToken');
        const response = await fetch(`${API_URL}/redeem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(award)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao resgatar prêmio');
        return data;
    },

    async updateProfile(profileData) {
        const token = localStorage.getItem('makerToken');
        const response = await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao atualizar perfil');
        return data;
    },

    async getStats() {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao buscar estatísticas');
        return data;
    },

    // Admin methods
    async adminUpdateCoins(payload) {
        const response = await fetch(`${API_URL}/admin/update-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro na transação');
        return data;
    },

    async adminUpdateCoinsBulk(payload) {
        const response = await fetch(`${API_URL}/admin/update-coins-bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro na transação em grupo');
        return data;
    },

    async adminGetUsersByClass(turma) {
        const response = await fetch(`${API_URL}/admin/users/${turma}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao buscar usuários');
        return data;
    },

    async adminDeleteUser(payload) {
        const response = await fetch(`${API_URL}/admin/delete-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao remover usuário');
        return data;
    },

    async adminGetUserHistory(email) {
        const response = await fetch(`${API_URL}/admin/history/${email}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao buscar histórico');
        return data;
    },

    logout() {
        localStorage.removeItem('makerToken');
        localStorage.removeItem('makerUser');
        window.location.href = 'login.html';
    }
};

window.apiClient = apiClient;
