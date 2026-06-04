/**
 * Cloudflare Pages Function — Meta Ads API Proxy
 * Route: /api/meta
 *
 * Variáveis de ambiente necessárias no Cloudflare Pages:
 *   META_ACCESS_TOKEN   — Token de acesso longo do Meta
 *   META_AD_ACCOUNT_ID  — ID da conta (sem o prefixo "act_")
 *
 * Para rodar localmente:
 *   wrangler pages dev . --binding META_ACCESS_TOKEN=xxx --binding META_AD_ACCOUNT_ID=xxx
 */

const META_API_VERSION = "v20.0";
const META_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

async function fetchAllPages(url) {
  let allData = [];
  let nextUrl = url;
  while (nextUrl) {
    const res  = await fetch(nextUrl);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
    allData = allData.concat(json.data || []);
    nextUrl = json.paging?.next || null;
  }
  return allData;
}

// Troque pela URL do seu domínio Cloudflare Pages após o deploy
// Ex: "https://meu-dashboard.pages.dev" ou seu domínio customizado
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

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "overview";
  const datePreset = url.searchParams.get("date_preset") || "last_30d";
  const timeRangeStart = url.searchParams.get("since");
  const timeRangeEnd = url.searchParams.get("until");

  const token = env.META_ACCESS_TOKEN;
  const accountId = env.META_AD_ACCOUNT_ID;

  if (!token || !accountId) {
    return cors(
      { error: "Variáveis META_ACCESS_TOKEN e META_AD_ACCOUNT_ID não configuradas no Cloudflare Pages." },
      500
    );
  }

  const dateParam = timeRangeStart && timeRangeEnd
    ? `time_range={"since":"${timeRangeStart}","until":"${timeRangeEnd}"}`
    : `date_preset=${datePreset}`;

  try {
    let data;

    switch (type) {
      case "overview": {
        const fields = [
          "spend", "impressions", "reach", "clicks", "ctr",
          "cpm", "cpc", "frequency",
          "actions", "action_values", "cost_per_action_type",
        ].join(",");

        const rows = await fetchAllPages(
          `${META_BASE}/act_${accountId}/insights?fields=${fields}&${dateParam}&limit=500&access_token=${token}`
        );
        data = { data: rows };
        break;
      }

      case "daily": {
        const fields = [
          "spend", "impressions", "clicks", "ctr", "cpm", "cpc",
          "actions", "action_values",
        ].join(",");

        const rows = await fetchAllPages(
          `${META_BASE}/act_${accountId}/insights?fields=${fields}&${dateParam}&time_increment=1&limit=500&access_token=${token}`
        );
        data = { data: rows };
        break;
      }

      case "campaigns": {
        const insightFields = [
          "campaign_id", "campaign_name", "spend", "impressions",
          "clicks", "ctr", "cpm", "cpc", "actions", "action_values",
        ].join(",");

        const [insightRows, campaignRows] = await Promise.all([
          fetchAllPages(
            `${META_BASE}/act_${accountId}/insights?fields=${insightFields}&${dateParam}&level=campaign&limit=500&access_token=${token}`
          ),
          fetchAllPages(
            `${META_BASE}/act_${accountId}/campaigns?fields=id,name,status,objective&limit=500&access_token=${token}`
          ),
        ]);

        const insightMap = {};
        for (const row of insightRows) {
          insightMap[row.campaign_id] = row;
        }

        const enriched = campaignRows.map(c => {
          const ins = insightMap[c.id] || {};
          return {
            campaign_id:   c.id,
            campaign_name: c.name,
            status:        c.status,
            objective:     c.objective || "—",
            spend:         ins.spend         || "0",
            impressions:   ins.impressions   || "0",
            clicks:        ins.clicks        || "0",
            ctr:           ins.ctr           || "0",
            cpm:           ins.cpm           || "0",
            cpc:           ins.cpc           || "0",
            actions:       ins.actions       || [],
            action_values: ins.action_values || [],
          };
        });

        data = { data: enriched };
        break;
      }

      case "adsets": {
        const insightFields = [
          "adset_id", "adset_name", "campaign_name", "spend", "impressions",
          "clicks", "ctr", "cpm", "cpc", "actions", "action_values",
        ].join(",");

        const [insightRows, adsetRows] = await Promise.all([
          fetchAllPages(
            `${META_BASE}/act_${accountId}/insights?fields=${insightFields}&${dateParam}&level=adset&limit=500&access_token=${token}`
          ),
          fetchAllPages(
            `${META_BASE}/act_${accountId}/adsets?fields=id,name,status,campaign_id,campaign{name},optimization_goal,daily_budget,lifetime_budget&limit=500&access_token=${token}`
          ),
        ]);

        const insightMap = {};
        for (const row of insightRows) {
          insightMap[row.adset_id] = row;
        }

        const enriched = adsetRows.map(a => {
          const ins = insightMap[a.id] || {};
          return {
            adset_id:          a.id,
            adset_name:        a.name,
            campaign_name:     a.campaign?.name || ins.campaign_name || "—",
            status:            a.status,
            optimization_goal: a.optimization_goal || "—",
            daily_budget:      a.daily_budget,
            lifetime_budget:   a.lifetime_budget,
            spend:             ins.spend       || "0",
            impressions:       ins.impressions || "0",
            clicks:            ins.clicks      || "0",
            ctr:               ins.ctr         || "0",
            cpm:               ins.cpm         || "0",
            cpc:               ins.cpc         || "0",
            actions:           ins.actions       || [],
            action_values:     ins.action_values || [],
          };
        });

        data = { data: enriched };
        break;
      }

      case "ads": {
        const insightFields = [
          "ad_id", "ad_name", "adset_name", "campaign_name", "spend",
          "impressions", "clicks", "ctr", "cpc", "actions", "action_values",
        ].join(",");

        const [insightRows, adRows] = await Promise.all([
          fetchAllPages(
            `${META_BASE}/act_${accountId}/insights?fields=${insightFields}&${dateParam}&level=ad&limit=500&access_token=${token}`
          ),
          fetchAllPages(
            `${META_BASE}/act_${accountId}/ads?fields=id,name,status,creative{id,thumbnail_url,instagram_permalink_url,object_story_id}&limit=500&access_token=${token}`
          ),
        ]);

        const adMeta = {};
        for (const a of adRows) {
          const cr = a.creative || {};
          let permalink = cr.instagram_permalink_url || null;
          if (!permalink && cr.object_story_id) {
            const parts = cr.object_story_id.split('_');
            if (parts.length >= 2) {
              const pageId = parts[0];
              const postId = parts.slice(1).join('_');
              permalink = `https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${pageId}`;
            }
          }
          adMeta[a.id] = {
            status:              a.status,
            thumbnail_url:       cr.thumbnail_url || null,
            permalink_url:       permalink,
            instagram_permalink: cr.instagram_permalink_url || null,
          };
        }

        const enriched = insightRows.map(row => {
          const meta = adMeta[row.ad_id] || {};
          return {
            ad_id:               row.ad_id,
            ad_name:             row.ad_name        || "—",
            adset_name:          row.adset_name     || "—",
            campaign_name:       row.campaign_name  || "—",
            status:              meta.status        || "ACTIVE",
            thumbnail_url:       meta.thumbnail_url || null,
            permalink_url:       meta.permalink_url || null,
            instagram_permalink: meta.instagram_permalink || null,
            spend:               row.spend          || "0",
            impressions:         row.impressions    || "0",
            clicks:              row.clicks         || "0",
            ctr:                 row.ctr            || "0",
            cpc:                 row.cpc            || "0",
            actions:             row.actions        || [],
            action_values:       row.action_values  || [],
          };
        });

        data = { data: enriched };
        break;
      }

      case "demographics": {
        const dFields = "impressions,reach,spend,actions";
        const [ageRows, genderRows, regionRows] = await Promise.all([
          fetchAllPages(`${META_BASE}/act_${accountId}/insights?fields=${dFields}&breakdowns=age&${dateParam}&limit=500&access_token=${token}`),
          fetchAllPages(`${META_BASE}/act_${accountId}/insights?fields=${dFields}&breakdowns=gender&${dateParam}&limit=500&access_token=${token}`),
          fetchAllPages(`${META_BASE}/act_${accountId}/insights?fields=${dFields}&breakdowns=region&${dateParam}&limit=500&access_token=${token}`),
        ]);
        data = { age: ageRows, gender: genderRows, region: regionRows };
        break;
      }

      case "audiences": {
        const metaUrl =
          `${META_BASE}/act_${accountId}/customaudiences?fields=id,name,subtype,approximate_count_lower_bound,approximate_count_upper_bound,data_source,time_updated&limit=100&access_token=${token}`;
        const res = await fetch(metaUrl);
        data = await res.json();
        break;
      }

      case "account": {
        const metaUrl =
          `${META_BASE}/act_${accountId}?fields=name,currency,account_status,timezone_name&access_token=${token}`;
        const res = await fetch(metaUrl);
        data = await res.json();
        break;
      }

      default:
        return cors({ error: `Tipo desconhecido: ${type}` }, 400);
    }

    return cors(data);
  } catch (err) {
    return cors({ error: err.message }, 500);
  }
}
