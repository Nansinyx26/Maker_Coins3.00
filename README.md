# Maker Coin System

## 📚 Sobre o Projeto

O **Maker Coin System** é um sistema gamificado de pontuação para alunos, desenvolvido com **HTML, CSS e JavaScript**, utilizando **localStorage** para persistência de dados. Ele permite atribuir e gerenciar "coins" de forma divertida e educativa, promovendo engajamento e disciplina por meio de rankings e histórico individual.

---

## 🎮 Funcionalidades

- ✅ **Atualização de Coins**
  - Interface para somar ou subtrair coins de alunos de uma turma específica (3º ou 5º ano).
  
- ✅ **Padronização de nomes**
  - Nomes são convertidos para minúsculas, sem acentos e espaços extras — evitando duplicações acidentais.

- ✅ **Leaderboard por turma**
  - Mostra os rankings de alunos por coins, separados por turma (5°A, 5°B, 5°C, 3°A, 3°B, 3°C).

- ✅ **Contadores dinâmicos**
  - Exibe em tempo real o número de alunos e a soma de coins da turma selecionada.

- ✅ **Histórico individual**
  - Toda alteração em coins é registrada com data e valor. O histórico pode ser consultado por nome.

- ✅ **Exportar dados em TXT**
  - Permite exportar os dados da turma atual em formato `.txt`.

- ✅ **Exclusão de aluno**
  - Remove os dados e o histórico completo do aluno.

- ✅ **Autenticação por senha**
  - O acesso à tela de atualização exige uma senha para evitar edições não autorizadas.

- ✅ **Modo Negativo com Justificativa (3º ano)**
  - Penalizações negativas exigem explicação, promovendo transparência e reflexão.

---

## 🗂️ Estrutura do Projeto

### 🏠 Página Inicial
- `index.html` — Entrada do sistema, com acesso ao 5º ano e 3º ano.
- `index3.html` — Entrada exclusiva para o 3º ano.

### 📊 Visualização (Leaderboard)
- `frontend.html` — Leaderboard para o 5º ano.
- `frontend3.html` — Leaderboard para o 3º ano.

### ✏️ Atualização de Dados
- `atualizacao.html` — Atualização de coins do 5º ano.
- `atualizacao3.html` — Atualização de coins do 3º ano (com justificativa para penalidades).

### 📁 Estilos
- `css/style1.css` — Estilo do sistema do 5º ano.
- `css/style3ano.css` — Estilo visual otimizado para o 3º ano.

### 🧠 Scripts
- `js/frontend.js` — Geração de leaderboard (5º ano).
- `js/frontend3.js` — Geração de leaderboard (3º ano).
- `js/atualizacao.js` — Cadastro, histórico e exportação de dados.
- `js/index.js` — Autenticação por senha.

---

## 🚀 Como Usar

1. Abra `index.html` (5º ano) ou `index3.html` (3º ano).
2. Clique em **Atualizar** (será solicitado a senha `Mantra2222`).
3. Escolha a turma (ex: 5°B ou 3°C).
4. Digite o nome do aluno e a quantidade de coins.
5. Clique em **Salvar**.
6. Acesse a **Leaderboard** para ver a classificação.
7. Use o campo de pesquisa para visualizar o histórico individual.
8. Clique em **Exportar TXT** para gerar relatório da turma.
9. No 3º ano, ao marcar “Negativo”, uma justificativa será exigida.

---

## 🛠️ Tecnologias Utilizadas

- HTML5  
- CSS3  
- JavaScript Puro (sem frameworks)
- `localStorage` para persistência offline no navegador

---

## 📌 Observações Finais

- Os dados são salvos localmente (não requer servidor).
- A senha padrão para atualização é: `Mantra2222`
- Ideal para uso em sala de aula, promovendo gamificação e acompanhamento do comportamento.

---

Criado com 💡 e 🎓 para incentivar o aprendizado com diversão!
