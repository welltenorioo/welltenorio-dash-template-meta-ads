# Meta Ads Dashboard — Design System

Este repositório é um template de dashboard para Meta Ads usando Cloudflare Pages.
Ao pedir mudanças ao Claude Code, ele deve seguir exatamente este design system.

---

## Modo Setup — Onboarding Guiado

**Quando um novo usuário abrir este projeto, verifique imediatamente:**

1. Se `index.html` ainda contém o texto `NOME_DO_CLIENTE`
2. Se `ALLOWED_ORIGIN` em `functions/api/meta.js` ainda é `"*"`

Se qualquer uma dessas condições for verdadeira, o projeto **ainda não foi configurado para um cliente**. Nesse caso, **inicie automaticamente o onboarding guiado** seguindo o roteiro abaixo. Não espere o usuário pedir — apresente-se e comece.

### Roteiro de onboarding

Apresente-se assim e faça o levantamento inicial **em uma única mensagem** antes de começar qualquer etapa:

> "Olá! Vejo que este dashboard ainda não foi configurado. Antes de começar, me conta rapidinho o que você já tem pronto para eu não te fazer repetir passos desnecessários:"
>
> 1. Qual o nome do cliente para este dashboard?
> 2. Você já tem conta na **Cloudflare**? (sim / não)
> 3. Você já tem conta no **Facebook Business Manager**? (sim / não)
> 4. Você já tem um **app criado** no developers.facebook.com para este projeto? (sim / não)
> 5. Você já tem um **usuário do sistema** criado no Business Manager? (sim / não)
> 6. Você já tem o **token de acesso** da Meta Ads API? (sim / não — se sim, já pode me passar)
> 7. Você já tem o **ID da conta de anúncios** do cliente? (sim / não — se sim, me passa também, só os números sem `act_`)

Com as respostas em mãos, pule as etapas já concluídas e comece pela primeira que ainda falta. Explique sempre o que fazer e por quê antes de pedir qualquer ação.

---

**Etapa 1 — Nome do cliente**
Já coletado na apresentação. Substitua todas as ocorrências de `NOME_DO_CLIENTE` no `index.html` (aparecem 3 vezes) e atualize o `<title>` de `"Meta Ads Dashboard"` para o nome do cliente. Atualize também o `name` no `wrangler.toml` para um slug sem espaços (ex: `maria-silva-dashboard`). Faça commit e push imediatamente após.

**Etapa 2 — Conta na Cloudflare**
Pergunta já feita. Se o usuário disse que **não tem conta**: instrua a acessar cloudflare.com, criar conta gratuita e confirmar o e-mail. Se disse que **já tem**, pule direto para a Etapa 3.

**Etapa 3 — Cloudflare Pages**
Pergunte: *"Você já tem um projeto Pages criado para este cliente na Cloudflare?"*
- Se **não**: guie — Workers & Pages → Create → Pages → Connect to Git → selecionar o repositório → deixar Build settings em branco → Save and Deploy. Peça a URL gerada (ex: `https://projeto.pages.dev`).
- Se **sim**: peça a URL do projeto existente.
Com a URL em mãos, atualize `ALLOWED_ORIGIN` em `functions/api/meta.js` e faça commit e push.

**Etapa 4 — App no Facebook para Desenvolvedores**
Pergunta já feita. Se o usuário disse que **não tem app**: guie — developers.facebook.com → Meus Apps → Criar App → tipo "Outros" → "Empresa" → vincular Business Manager → Criar App. Em seguida, vincular a conta de anúncios: Business Manager → Configurações do Negócio → Contas → Apps → selecionar o app → Adicionar Ativos → Contas de Anúncios → marcar a conta do cliente → Salvar. Se **já tem app**, confirme apenas que a conta de anúncios do cliente está vinculada ao app.

**Etapa 5 — Usuário do sistema e token**
Pergunta já feita. Se o usuário disse que **não tem usuário do sistema**: guie — Business Manager → Configurações do Negócio → Usuários → Usuários do Sistema → Adicionar → papel "Administrador" → Adicionar Ativos → Contas de Anúncios → conta do cliente → permissão "Gerenciar campanhas" → Salvar. Se **já tem usuário**, pule a criação e vá direto para o token.

Para o token (sempre necessário se não foi informado na apresentação): no usuário do sistema → Gerar Novo Token → selecionar o app → marcar `ads_read`, `ads_management`, `read_insights` → Gerar Token → copiar e salvar. **O token só aparece uma vez.**

Se token e ID da conta já foram fornecidos na apresentação, pule direto para a Etapa 6.

**Etapa 6 — Secrets na Cloudflare**
Instrua a ir em Workers & Pages → projeto → Settings → Environment Variables e adicionar:
- `META_ACCESS_TOKEN` = o token copiado
- `META_AD_ACCOUNT_ID` = o ID **sem** o prefixo `act_` (só os números)
Após salvar, instruir a ir em Deployments → Retry deploy para o deploy carregar as variáveis.

**Etapa 7 — Logo do cliente**
Pergunte: *"Você tem a logo do cliente para colocar no dashboard?"*
- Se **sim**: instrua a substituir o arquivo `assets/logo.webp` pela logo do cliente em formato `.webp`, tamanho recomendado 40×40px. Após substituir, faça commit e push.
- Se **não**: informe que está usando a logo padrão do Meta e que pode ser trocada a qualquer momento.

**Etapa 8 — Commit final e verificação**
Confirme que todos os arquivos alterados foram commitados e pushed. Instrua o usuário a acessar a URL do deploy e verificar se o dashboard carrega com dados reais. Teste sugerido: trocar o período de data para "Últimos 30 dias" e verificar se as campanhas aparecem.

Se aparecer erro, diagnostique:
- `"Variáveis não configuradas"` → secrets não foram salvas ou o deploy não foi refeito
- Dados zerados → período sem campanhas ativas, ou permissões do token insuficientes
- Erro de CORS → `ALLOWED_ORIGIN` não foi atualizado ou o deploy com a mudança ainda não rodou
- `"act_act_"` no erro → ID da conta foi salvo com o prefixo `act_`, precisa remover

### Regras durante o onboarding

- Faça o levantamento inicial completo **antes** de começar qualquer etapa — evita idas e vindas
- Nunca pule uma etapa sem confirmação explícita de que já está feita
- Se o usuário travar, explique com mais detalhes e ofereça ajuda passo a passo
- Ao final, confirme que `NOME_DO_CLIENTE` não existe mais no código e que `ALLOWED_ORIGIN` foi atualizado
- Sempre que fizer alterações no código, faça commit e push imediatamente
- O `<title>` no `index.html` está como `"Meta Ads Dashboard"` — não contém `NOME_DO_CLIENTE`, precisa ser atualizado separadamente

---

## Stack

- **HTML único** (`index.html`) — sem build step, sem bundler
- **Tailwind CSS** via CDN com config customizada inline
- **Chart.js** via CDN para gráficos
- **Cloudflare Pages Functions** para proxies de API (`functions/api/`)
- **Google Fonts**: Fira Code (mono) + Fira Sans (sans)

---

## Paleta de cores (dark theme)

```js
colors: {
  surface: {
    DEFAULT: '#0a0a0f',  // fundo da página
    2:       '#111118',  // cards
    3:       '#18181f',  // hover / thead
    4:       '#1e1e2a',  // bordas padrão
    5:       '#252535',  // bordas fortes / skeleton highlight
  },
  border:  { DEFAULT: '#1e1e2a', strong: '#2e2e40' },
  accent:  { DEFAULT: '#6366f1', hover: '#818cf8', muted: '#6366f120' },
  violet:  { DEFAULT: '#8b5cf6', muted: '#8b5cf620' },
  success: { DEFAULT: '#10b981', muted: '#10b98115' },
  danger:  { DEFAULT: '#ef4444', muted: '#ef444415' },
  warn:    { DEFAULT: '#f59e0b', muted: '#f59e0b15' },
  sky:     { DEFAULT: '#38bdf8', muted: '#38bdf820' },
}
```

---

## Classes CSS customizadas

### `.card`
Card base: fundo `#111118`, borda `1px solid #1e1e2a`, `border-radius: 12px`.
No hover a borda vai para `#2e2e40`.

### `.kpi-accent-*`
Gradiente de fundo para cards KPI. Variantes disponíveis:
`indigo` `violet` `sky` `emerald` `amber` `rose` `cyan` `lime` `orange` `pink`

Exemplo: `<div class="card kpi-accent-indigo">`

### `.badge`
Chip inline com variantes: `.badge-success` `.badge-danger` `.badge-warn` `.badge-neutral`

### `.data-table`
Tabela com `th` uppercase cinza, `td` com `border-bottom`, hover por linha.
Sempre envolver em `.table-scroll-wrap` para scroll horizontal com fade lateral.

### `.skeleton`
Shimmer animado para loading states. `border-radius: 8px` incluso.

### `.nav-link`
Item de menu lateral. Estado ativo: `.active` (cor `#818cf8`, fundo `#6366f115`).

### `.date-btn`
Botão de seleção de período. Estado ativo: `.active`.

### `.metric-toggle`
Chip de toggle para selecionar métricas no gráfico.

### `.trend-up` / `.trend-down` / `.trend-flat`
Cores para variações: verde `#10b981`, vermelho `#ef4444`, cinza `#64748b`.

---

## Variáveis CSS (z-index)

```css
:root {
  --z-content:  0;
  --z-overlay: 30;
  --z-sidebar: 40;
  --z-toast:   50;
}
```

---

## Fontes

- **Body / UI**: `Fira Sans` (weights: 300, 400, 500, 600, 700)
- **Números / código**: `Fira Code` (weights: 400, 500, 600, 700)
- Valores monetários e métricas usam `font-family: ui-monospace, monospace` via classe `.kpi-value`

---

## Variáveis de ambiente (Cloudflare Pages)

| Variável | Descrição |
|----------|-----------|
| `META_ACCESS_TOKEN` | Token de acesso longo da Meta Ads API |
| `META_AD_ACCOUNT_ID` | ID da conta sem prefixo `act_` |

---

## Personalização por cliente

Ao criar um novo dashboard para um cliente, substituir:

1. `NOME_DO_CLIENTE` no `index.html` → nome real do cliente
2. `assets/logo.webp` → logo do cliente (recomendado: 40×40px, formato webp)
3. `<title>` no `index.html` → nome do cliente
4. `ALLOWED_ORIGIN` em `functions/api/meta.js` → domínio final do deploy
5. `name` no `wrangler.toml` → slug do projeto (ex: `cliente-dashboard`)

---

## Estrutura de arquivos

```
├── index.html              # Dashboard completo
├── assets/
│   └── logo.webp           # Logo do cliente (substituir)
├── functions/
│   └── api/
│       └── meta.js         # Proxy Meta Ads API
├── wrangler.toml           # Config Cloudflare (dev local)
├── _redirects              # Redirects Cloudflare Pages
└── CLAUDE.md               # Este arquivo
```
