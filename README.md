# Meta Ads Dashboard — Template

Dashboard profissional para Meta Ads hospedado no Cloudflare Pages. Sem código, sem servidor, sem mensalidade de ferramenta.

## O que você terá ao final

- Dashboard com métricas em tempo real da sua conta Meta Ads
- KPIs: Gasto, CPM, CTR, CPC, ROAS, Conversões, CPA, Frequência
- Gráficos de performance diária, campanhas, conjuntos e anúncios individuais
- Funil de conversão, audiências e diagnósticos da conta
- URL própria no Cloudflare Pages (grátis)

## Como usar este template

A forma mais fácil é abrir este repositório no **Claude Code** e deixar o assistente te guiar por cada etapa.
Ao abrir o projeto, o Claude vai detectar que o setup ainda não foi feito e vai iniciar o processo automaticamente.

Se preferir fazer manual, siga o passo a passo abaixo.

---

## Passo a passo completo

### Pré-requisitos

- Conta no GitHub → [github.com](https://github.com)
- Conta na Cloudflare → [cloudflare.com](https://cloudflare.com)
- Acesso ao Facebook Business Manager com permissão na conta de anúncios

**Tempo estimado: 30 a 45 minutos**

---

### Etapa 1 — Copiar o repositório

1. No GitHub, clique no botão verde **"Use this template"** → **"Create a new repository"**
2. Dê um nome ao repositório (ex: `cliente-dashboard`)
3. Selecione **Private** (recomendado)
4. Clique em **"Create repository"**

---

### Etapa 2 — Criar conta na Cloudflare

1. Acesse [cloudflare.com](https://cloudflare.com) e crie uma conta gratuita
2. Confirme o e-mail

---

### Etapa 3 — Criar o projeto no Cloudflare Pages

1. No painel da Cloudflare, clique em **"Workers & Pages"** no menu lateral
2. Clique em **"Create"** → aba **"Pages"** → **"Connect to Git"**
3. Conecte sua conta do GitHub quando solicitado
4. Selecione o repositório que você criou na Etapa 1
5. Em **"Build settings"**, deixe tudo em branco (não há build step)
6. Clique em **"Save and Deploy"**
7. Aguarde o deploy terminar e anote a URL gerada (ex: `https://seu-projeto.pages.dev`)

---

### Etapa 4 — Criar o app no Facebook para Desenvolvedores

1. Acesse [developers.facebook.com](https://developers.facebook.com) e faça login
2. Clique em **"Meus Apps"** → **"Criar App"**
3. Selecione o tipo **"Outros"** → clique em **"Avançar"**
4. Selecione o tipo de app **"Empresa"** → clique em **"Avançar"**
5. Preencha o nome do app (ex: `Dashboard Cliente X`)
6. Em **"Business Account"**, selecione seu Business Manager
7. Clique em **"Criar App"**

---

### Etapa 5 — Vincular a conta de anúncios ao app

1. Acesse o Business Manager em [business.facebook.com](https://business.facebook.com)
2. Vá em **"Configurações do Negócio"** → **"Contas"** → **"Apps"**
3. Localize o app que você criou na Etapa 4 e clique nele
4. Clique em **"Adicionar Ativos"** → selecione **"Contas de Anúncios"**
5. Marque a conta de anúncios do cliente e clique em **"Salvar Alterações"**

---

### Etapa 6 — Criar o usuário do sistema e gerar o token

1. No Business Manager ([business.facebook.com](https://business.facebook.com)), vá em **"Configurações do Negócio"**
2. No menu lateral, clique em **"Usuários"** → **"Usuários do Sistema"**
3. Clique em **"Adicionar"**, dê um nome (ex: `Dashboard Bot`) e selecione o papel **"Administrador"**
4. Com o usuário criado, clique em **"Adicionar Ativos"**
5. Selecione **"Contas de Anúncios"**, escolha a conta do cliente e marque a permissão **"Gerenciar campanhas"**
6. Clique em **"Salvar Alterações"**
7. Volte ao usuário do sistema e clique em **"Gerar Novo Token"**
8. Selecione o app que você criou na Etapa 4
9. Marque as permissões: `ads_read`, `ads_management`, `read_insights`
10. Clique em **"Gerar Token"**
11. **Copie e salve o token gerado** — ele só aparece uma vez

> O ID da conta de anúncios está em Business Manager → Contas de Anúncios. O formato é `act_XXXXXXXXXX` — você vai precisar **apenas dos números**, sem o `act_`.

---

### Etapa 7 — Configurar os secrets no Cloudflare Pages

1. No painel da Cloudflare, vá em **"Workers & Pages"** → clique no seu projeto
2. Clique em **"Settings"** → **"Environment Variables"**
3. Clique em **"Add variable"** e adicione as duas variáveis abaixo:

| Nome | Valor |
|------|-------|
| `META_ACCESS_TOKEN` | O token gerado na Etapa 6 |
| `META_AD_ACCOUNT_ID` | O ID da conta **sem** o prefixo `act_` (só os números) |

4. Clique em **"Save"**
5. Vá em **"Deployments"** e clique em **"Retry deploy"** para o deploy carregar as variáveis

---

### Etapa 8 — Personalizar o dashboard para o cliente

Abra o repositório no Claude Code e peça para ele personalizar. Ou faça manualmente:

**No arquivo `index.html`:**
- Substitua todas as ocorrências de `NOME_DO_CLIENTE` pelo nome real do cliente
- Atualize o `<title>` no `<head>`

**No arquivo `functions/api/meta.js`:**
- Substitua `const ALLOWED_ORIGIN = "*"` pela URL do seu deploy:
  ```js
  const ALLOWED_ORIGIN = "https://seu-projeto.pages.dev";
  ```

**No arquivo `wrangler.toml`:**
- Atualize o `name` para o slug do projeto:
  ```toml
  name = "cliente-dashboard"
  ```

**A logo:**
- Substitua `assets/logo.webp` pela logo do cliente (40×40px, formato `.webp`)

Após editar, faça commit e push. O Cloudflare vai fazer o deploy automaticamente.

---

### Etapa 9 — Verificar se está tudo funcionando

1. Acesse a URL do seu projeto (ex: `https://seu-projeto.pages.dev`)
2. O dashboard deve carregar com os dados reais da conta de anúncios
3. Teste trocar os períodos de data (Últimos 7 dias, 30 dias, etc.)
4. Verifique se as campanhas aparecem na aba **Campanhas**

Se aparecer erro de API, verifique:
- Se o `META_AD_ACCOUNT_ID` está sem o prefixo `act_`
- Se o token tem as permissões corretas (`ads_read`, `read_insights`)
- Se o usuário do sistema tem acesso à conta de anúncios

---

## Estrutura do projeto

```
├── index.html              # Dashboard completo (HTML + JS + CSS)
├── assets/
│   └── logo.webp           # Logo do cliente (substituir)
├── functions/
│   └── api/
│       └── meta.js         # Proxy seguro para a Meta Ads API
├── wrangler.toml           # Config para desenvolvimento local
├── _redirects              # Redirects do Cloudflare Pages
└── CLAUDE.md               # Design system (para uso com Claude Code)
```

---

## Desenvolvimento local

Para rodar o projeto localmente com dados reais:

```bash
npm install -g wrangler
wrangler pages dev . --binding META_ACCESS_TOKEN=seu_token --binding META_AD_ACCOUNT_ID=seu_account_id
```

Acesse em `http://localhost:8788`

---

## Dúvidas frequentes

**O dashboard mostra dados zerados**
Verifique se o período selecionado tem campanhas ativas. Tente selecionar "Este ano" ou um período customizado mais amplo.

**Erro "Variáveis não configuradas"**
As variáveis de ambiente no Cloudflare não foram salvas ou o deploy não foi refeito após salvá-las.

**Erro de CORS**
Você precisa atualizar o `ALLOWED_ORIGIN` em `functions/api/meta.js` com a URL real do seu deploy.

**O token expirou**
Tokens de usuário do sistema são permanentes por padrão. Se expirou, verifique se foi gerado como token de usuário do sistema (não token de usuário pessoal).
