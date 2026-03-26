# 🚀 Deploy no Render - Maker Coins

## Passo 1: Criar conta no Render
1. Acesse [render.com](https://render.com)
2. Faça login com sua conta GitHub

## Passo 2: Criar novo Web Service
1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub: `Nansinyx26/Maker_Coins3.00`
3. Configure:
   - **Name**: `maker-coins-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## Passo 3: Configurar Variáveis de Ambiente
Na seção **Environment**, adicione:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `sua-string-de-conexao-mongodb-atlas` |
| `JWT_SECRET` | `uma-chave-secreta-forte` (ex: `MakerCoins2026SecretKey!@#`) |
| `NODE_ENV` | `production` |

⚠️ **IMPORTANTE**: Copie a `MONGODB_URI` do seu arquivo `.env` local!

## Passo 4: Deploy
1. Clique em **"Create Web Service"**
2. Aguarde o build completar (2-5 minutos)
3. Sua API estará disponível em: `https://maker-coins-api.onrender.com`

## Passo 5: Testar
Acesse: `https://seu-app.onrender.com/login.html`

---

## 📝 Notas Importantes

### Free Tier do Render
- O servidor "dorme" após 15 minutos de inatividade
- Primeira requisição após dormir pode demorar ~30 segundos
- Para manter sempre ativo, considere o plano pago ($7/mês)

### MongoDB Atlas
- Certifique-se de que o IP `0.0.0.0/0` está liberado no Network Access
- Ou adicione os IPs do Render nas configurações do Atlas

---

## 🔗 Links Úteis
- GitHub: https://github.com/Nansinyx26/Maker_Coins3.00
- Render Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://cloud.mongodb.com
