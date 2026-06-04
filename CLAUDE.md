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

Apresente-se assim:

> "Olá! Vejo que este dashboard ainda não foi configurado. Vou te guiar por cada etapa — é só me responder conforme avançamos. Vamos começar?"

Em seguida, percorra as etapas na ordem abaixo. **Confirme a conclusão de cada etapa antes de avançar para a próxima.** Para cada etapa, explique o que fazer, por que fazer, e o que você precisa que o usuário te informe ao final.

**Etapa 1 — Nome do cliente**
Pergunte o nome do cliente. Com ele em mãos, substitua todas as ocorrências de `NOME_DO_CLIENTE` no `index.html` e atualize o `<title>`. Atualize também o `name` no `wrangler.toml` para um slug sem espaços (ex: `maria-silva-dashboard`).

**Etapa 2 — Conta na Cloudflare**
Instrua o usuário a criar conta em cloudflare.com se ainda não tiver. Confirme quando estiver feito.

**Etapa 3 — Cloudflare Pages**
Guie o usuário a criar um projeto Pages conectando o repositório GitHub. Explique: Workers & Pages → Create → Pages → Connect to Git → selecionar o repo → sem build settings → Save and Deploy. Peça a URL gerada (ex: `https://projeto.pages.dev`). Com a URL em mãos, atualize `ALLOWED_ORIGIN` em `functions/api/meta.js`.

**Etapa 4 — App no Facebook para Desenvolvedores**
Guie pelo passo a passo em developers.facebook.com: criar app tipo "Outros" → "Empresa" → vincular Business Manager. Após criar o app, instruir a ir no Business Manager (business.facebook.com) → Configurações do Negócio → Contas → Apps → selecionar o app → Adicionar Ativos → Contas de Anúncios → marcar a conta do cliente → Salvar.

**Etapa 5 — Usuário do sistema e token**
Guie em business.facebook.com: Configurações do Negócio → Usuários do Sistema → criar usuário Admin → adicionar ativo (conta de anúncios com permissão "Gerenciar campanhas") → Gerar Novo Token → selecionar o app → permissões `ads_read`, `ads_management`, `read_insights` → copiar token. Peça também o ID da conta de anúncios (só os números, sem `act_`).

**Etapa 6 — Secrets na Cloudflare**
Instrua a ir em Settings → Environment Variables do projeto Pages e adicionar:
- `META_ACCESS_TOKEN` = o token copiado
- `META_AD_ACCOUNT_ID` = o ID **sem** o prefixo `act_`
Após salvar, instruir a fazer Retry deploy.

**Etapa 7 — Logo do cliente**
Pergunte se o cliente tem logo. Se sim, instrua a substituir `assets/logo.webp` por um arquivo 40×40px em formato `.webp`.

**Etapa 8 — Commit e verificação**
Faça commit e push de todas as alterações. Instrua o usuário a acessar a URL do deploy e verificar se o dashboard carrega com dados reais. Se aparecer erro, diagnostique com base nas mensagens.

### Regras durante o onboarding

- Nunca pule uma etapa sem confirmação do usuário
- Se o usuário travar em alguma etapa, explique com mais detalhes e ofereça alternativas
- Ao final, confirme que `NOME_DO_CLIENTE` não existe mais no código e que `ALLOWED_ORIGIN` foi atualizado
- Sempre que fizer alterações no código, faça commit e push imediatamente

---

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
