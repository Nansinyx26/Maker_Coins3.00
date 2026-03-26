function showLeaderboard(className) {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = '';

  let totalNomes = 0;
  let totalCoins = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(className) && !key.includes('_historico')) {
      const name = key.split('_')[1];
      const coins = parseInt(localStorage.getItem(key), 10) || 0;
      totalNomes++;
      totalCoins += coins;

      const userCard = `
        <div class="user-card">
          <p class="user-name">${name}</p>
          <p class="user-coins">Coins: ${coins}</p>
        </div>
      `;
      leaderboard.innerHTML += userCard;
    }
  }

  document.getElementById('contador-nomes').textContent = `Nomes: ${totalNomes}`;
  document.getElementById('contador-coins').textContent = `Coins: ${totalCoins}`;
}

showLeaderboard('3A');
