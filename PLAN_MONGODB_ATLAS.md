# Plano de Implementação: Sistema de Contas Maker Coins com MongoDB Atlas

Este documento descreve as etapas necessárias para migrar o sistema atual (localStorage) para uma arquitetura full-stack com autenticação de alunos e persistência em banco de dados na nuvem.

## 1. Arquitetura Proposta
- **Frontend**: Mantém o design Cyberpunk/Glassmorphism existente (HTML/CSS/JS).
- **Backend**: Node.js com Express para API REST.
- **Banco de Dados**: MongoDB Atlas (Cloud) para armazenamento global.
- **Autenticação**: JWT (JSON Web Tokens) para sessões seguras.

## 2. Estrutura de Dados (Modelos MongoDB)
### Aluno (User)
- `nome`: String
- `email`: String (único)
- `senha`: Hash (bcrypt)
- `turma`: String (ex: '5A', '3º Ano')
- `saldo`: Number (Maker Coins)
- `avatar`: String (iniciais ou link)

### Transação (Transaction)
- `aluno_id`: ObjectId
- `valor`: Number (+ ou -)
- `descricao`: String
- `data`: Date

## 3. Próximos Passos de Desenvolvimento

### Fase 1: Setup do Backend (Server-side)
1. Criar pasta `/server` na raiz do projeto.
2. Inicializar Node.js (`npm init`) e instalar dependências: `express`, `mongoose`, `dotenv`, `cors`, `jsonwebtoken`, `bcryptjs`.
3. Configurar Cluster no **MongoDB Atlas** e obter a URI de conexão.
4. Criar modelos Mongoose para Alunos e Transações.

### Fase 2: API de Autenticação e Dados
1. Rota `POST /api/register`: Criar novo aluno com escolha de sala.
2. Rota `POST /api/login`: Validar credenciais e retornar Token JWT.
3. Rota `GET /api/me`: Obter dados do aluno logado (saldo, turma).
4. Rota `GET /api/ranking/:turma`: Obter ranking em tempo real da sala do aluno.
5. Rota `GET /api/history`: Obter extrato pessoal do aluno.

### Fase 3: Reformulação do Frontend
1. **Página de Cadastro/Login**: Criar `registro.html` com o mesmo estilo visual.
2. **Sistema de Sessão**: Modificar `js/index.js` para verificar se existe um token no `localStorage`.
3. **Migração de Renderização**:
   - Substituir as buscas que usam `localStorage.getItem()` por chamadas `fetch()` para o servidor.
   - O ranking será filtrado automaticamente pelo servidor baseado na turma do aluno.

### Fase 4: Integração dos Prêmios
1. Implementar sistema de "Compra/Resgate" no backend que verifica se o aluno tem saldo antes de debitar e registrar no extrato.

## 4. Benefícios da Mudança
- **Sincronização**: O aluno pode acessar sua conta de qualquer dispositivo.
- **Segurança**: Os coins não podem ser alterados editando o console do navegador.
- **Escalabilidade**: Suporte para centenas de alunos simultâneos.
