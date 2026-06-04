/**
 * Cloudflare Pages Function — Google Sheets API Proxy
 * Route: /api/sheets
 *
 * Variáveis de ambiente necessárias no Cloudflare Pages:
 *   SHEETS_SERVICE_ACCOUNT_EMAIL  — client_email do JSON da service account
 *   SHEETS_PRIVATE_KEY            — private_key do JSON (com -----BEGIN PRIVATE KEY-----)
 *   SHEETS_SPREADSHEET_ID         — ID da planilha (entre /d/ e /edit na URL)
 *
 * Query params:
 *   ?sheet=NomeDaAba     — nome da aba (padrão: primeira aba)
 *   ?range=A:Z           — intervalo A1 notation (padrão: A:Z)
 */

// Troque pela URL do seu domínio Cloudflare Pages após o deploy
const ALLOWED_ORIGIN = "*";

function cors(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type":                "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary":                        "Origin",
    },
  });
}

export async function onRequestOptions() {
  return cors(null, 204);
}

async function importPrivateKey(pem) {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const binary = atob(cleaned);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }

  return crypto.subtle.importKey(
    "pkcs8",
    buffer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toBase64url(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function getAccessToken(email, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);

  const header  = toBase64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = toBase64url(JSON.stringify({
    iss:   email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud:   "https://oauth2.googleapis.com/token",
    iat:   now,
    exp:   now + 3600,
  }));

  const signingInput = `${header}.${payload}`;
  const key = await importPrivateKey(privateKeyPem);

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${bufferToBase64url(signature)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    throw new Error(tokenData.error_description || tokenData.error);
  }
  return tokenData.access_token;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const email         = env.SHEETS_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = env.SHEETS_PRIVATE_KEY || "";
  const privateKey    = privateKeyRaw.replace(/\\n/g, "\n");
  const spreadsheetId = env.SHEETS_SPREADSHEET_ID;

  if (!email || !privateKey || !spreadsheetId) {
    return cors(
      { error: "Variáveis SHEETS_SERVICE_ACCOUNT_EMAIL, SHEETS_PRIVATE_KEY e SHEETS_SPREADSHEET_ID não configuradas no Cloudflare Pages." },
      500
    );
  }

  const sheetName = url.searchParams.get("sheet") || "";
  const range     = url.searchParams.get("range") || "A:Z";
  const fullRange = sheetName ? `${sheetName}!${range}` : range;

  try {
    const accessToken = await getAccessToken(email, privateKey);

    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(fullRange)}`;
    const sheetsRes = await fetch(sheetsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const sheetsData = await sheetsRes.json();

    if (sheetsData.error) {
      throw new Error(sheetsData.error.message || JSON.stringify(sheetsData.error));
    }

    const rows = sheetsData.values || [];
    if (rows.length === 0) {
      return cors({ data: [], meta: { range: fullRange, total: 0 } });
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined ? row[i] : "";
      });
      return obj;
    });

    return cors({
      data,
      meta: {
        range:   sheetsData.range,
        total:   data.length,
        headers,
      },
    });
  } catch (err) {
    return cors({ error: err.message }, 500);
  }
}
