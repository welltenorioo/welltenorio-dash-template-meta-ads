# Meta Ads Dashboard — Design System

Este repositório é um template de dashboard para Meta Ads usando Cloudflare Pages.
Ao pedir mudanças ao Claude Code, ele deve seguir exatamente este design system.

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
4. `ALLOWED_ORIGIN` em `functions/api/meta.js` e `sheets.js` → domínio final do deploy
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
