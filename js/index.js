function authenticate() {
  const password = prompt('Digite a senha para acessar a página de atualização:');
  const correctPassword = 'Mantra2222'; // Altere aqui se quiser outra senha

  if (password === correctPassword) {
    // Redireciona para a atualização do 5º ano
    window.location.href = 'atualizacao.html';
  } else {
    alert('Senha incorreta. Acesso negado.');
  }
}
