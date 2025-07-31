// Variáveis globais para controlar estado
let currentClass = '5A';
let currentSort = 'coins'; // 'coins' ou 'alphabetical'

/**
 * Função para exibir leaderboard de uma turma específica
 * @param {string} className - Nome da turma (5A, 5B, 5C)
 */
function showLeaderboard(className) {
    currentClass = className;
    
    // Atualizar visual dos botões de turma
    updateClassButtons(className);
    
    // Recarregar dados com a ordenação atual
    displayLeaderboard();
}

/**
 * Função para alternar entre tipos de ordenação
 * @param {string} sortType - Tipo de ordenação ('alphabetical' ou 'coins')
 */
function toggleSort(sortType) {
    currentSort = sortType;
    
    // Atualizar aparência dos botões de ordenação
    updateSortButtons(sortType);
    
    // Recarregar dados com nova ordenação
    displayLeaderboard();
}

/**
 * Atualiza o visual dos botões de ordenação
 * @param {string} sortType - Tipo de ordenação ativo
 */
function updateSortButtons(sortType) {
    const alphaButton = document.getElementById('sort-alpha');
    const coinsButton = document.getElementById('sort-coins');
    
    // Remover classe active de todos
    alphaButton.classList.remove('active');
    coinsButton.classList.remove('active');
    
    // Adicionar classe active no botão selecionado
    if (sortType === 'alphabetical') {
        alphaButton.classList.add('active');
    } else {
        coinsButton.classList.add('active');
    }
}

/**
 * Atualiza o visual dos botões de turma
 * @param {string} className - Nome da turma ativa
 */
function updateClassButtons(className) {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Remover classe active de todos os botões
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Adicionar classe active no botão da turma atual
    tabButtons.forEach(button => {
        if (button.textContent.trim() === `${className.charAt(0)}°${className.charAt(1)}`) {
            button.classList.add('active');
        }
    });
}

/**
 * Função principal para exibir os dados do leaderboard
 */
function displayLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';

    let totalNomes = 0;
    let totalCoins = 0;
    let students = [];

    // Coletar dados dos alunos da turma atual
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Verificar se a chave pertence à turma atual e não é histórico
        if (key.startsWith(currentClass) && !key.includes('_historico')) {
            const name = key.split('_')[1];
            const coins = parseInt(localStorage.getItem(key), 10) || 0;
            
            totalNomes++;
            totalCoins += coins;

            // Formatar nome para exibição (primeira letra maiúscula)
            const displayName = formatStudentName(name);
            
            students.push({
                name: displayName,
                coins: coins,
                originalName: name
            });
        }
    }

    // Aplicar ordenação baseada na seleção atual
    students = sortStudents(students, currentSort);

    // Criar e exibir cards dos alunos
    displayStudentCards(students);

    // Atualizar contadores no topo direito
    updateCounters(totalNomes, totalCoins);

    // Se não há dados, exibir mensagem
    if (students.length === 0) {
        displayEmptyMessage();
    }
}

/**
 * Formatar nome do aluno para exibição
 * @param {string} name - Nome original do aluno
 * @returns {string} - Nome formatado
 */
function formatStudentName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Ordenar array de alunos
 * @param {Array} students - Array de objetos aluno
 * @param {string} sortType - Tipo de ordenação
 * @returns {Array} - Array ordenado
 */
function sortStudents(students, sortType) {
    if (sortType === 'alphabetical') {
        return students.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', {
            sensitivity: 'base',
            ignorePunctuation: true
        }));
    } else {
        // Ordenar por coins (maior para menor)
        return students.sort((a, b) => {
            if (b.coins !== a.coins) {
                return b.coins - a.coins;
            }
            // Em caso de empate, ordenar alfabeticamente
            return a.name.localeCompare(b.name, 'pt-BR', {
                sensitivity: 'base',
                ignorePunctuation: true
            });
        });
    }
}

/**
 * Criar e exibir cards dos alunos
 * @param {Array} students - Array de alunos ordenado
 */
function displayStudentCards(students) {
    const leaderboard = document.getElementById('leaderboard');
    
    students.forEach((student, index) => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        
        // Adicionar posição se ordenado por coins
        let positionText = '';
        if (currentSort === 'coins') {
            positionText = `<span style="color: #1abc9c; font-weight: bold; margin-right: 0.5rem;">#${index + 1}</span>`;
        }
        
        // Cor especial para coins negativos
        const coinsColor = student.coins < 0 ? '#e74c3c' : '#95a5a6';
        
        userCard.innerHTML = `
            <p class="user-name">${positionText}${student.name}</p>
            <p class="user-coins" style="color: ${coinsColor};">
                Coins: ${student.coins}
            </p>
        `;
        
        leaderboard.appendChild(userCard);
    });
}

/**
 * Atualizar contadores no topo direito
 * @param {number} totalNomes - Total de nomes
 * @param {number} totalCoins - Total de coins
 */
function updateCounters(totalNomes, totalCoins) {
    document.getElementById('contador-nomes').textContent = `Nomes: ${totalNomes}`;
    document.getElementById('contador-coins').textContent = `Coins: ${totalCoins}`;
}

/**
 * Exibir mensagem quando não há dados
 */
function displayEmptyMessage() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #95a5a6;">
            <h3>Nenhum aluno encontrado</h3>
            <p>Adicione alunos na página de atualização para vê-los aqui.</p>
        </div>
    `;
}

/**
 * Função para detectar mudanças no localStorage (se necessário)
 */
function refreshData() {
    displayLeaderboard();
}

/**
 * Inicialização quando a página carrega
 */
window.onload = function() {
    // Definir turma padrão como ativa
    updateClassButtons(currentClass);
    updateSortButtons(currentSort);
    
    // Carregar dados iniciais
    displayLeaderboard();
    
    // Atualizar dados a cada 30 segundos (opcional)
    setInterval(refreshData, 30000);
};

// Event listeners adicionais (se necessário)
document.addEventListener('DOMContentLoaded', function() {
    // Código adicional se necessário quando DOM estiver pronto
});

/**
 * Função utilitária para debug (pode ser removida em produção)
 */
function debugLocalStorage() {
    console.log('=== DEBUG LOCALSTORAGE ===');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value}`);
    }
    console.log('========================');
}
