import type {APIRoute} from "astro"

export const prerender = false

// Wird täglich von Vercel Cron aufgerufen (siehe vercel.json → crons) und
// stößt über den Deploy-Hook einen frischen Build an. Nötig, weil die Seiten
// statisch vorgerendert sind: "Diese Woche im Kino" und die Vorstellungs-
// Filter rechnen mit dem Datum zur Build-Zeit und veralten sonst.
// Sanity-Content-Änderungen triggern den Deploy-Hook direkt (Sanity-Webhook),
// dieser Endpoint deckt nur den täglichen Datums-Refresh ab.
export const GET: APIRoute = async ({request}) => {
  const hookUrl = import.meta.env.VERCEL_DEPLOY_HOOK_URL
  const cronSecret = import.meta.env.CRON_SECRET

  // Vercel Cron sendet "Authorization: Bearer <CRON_SECRET>", wenn die
  // Env-Var gesetzt ist — dann lassen wir nur diese Aufrufe durch.
  if (cronSecret) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ok: false, message: "Nicht autorisiert."}), {
        status: 401,
        headers: {"content-type": "application/json"},
      })
    }
  }

  if (!hookUrl) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "VERCEL_DEPLOY_HOOK_URL ist nicht konfiguriert — Rebuild übersprungen.",
      }),
      {status: 501, headers: {"content-type": "application/json"}}
    )
  }

  const res = await fetch(hookUrl, {method: "POST"})
  if (!res.ok) {
    return new Response(
      JSON.stringify({ok: false, message: `Deploy-Hook antwortete mit ${res.status}.`}),
      {status: 502, headers: {"content-type": "application/json"}}
    )
  }

  return new Response(JSON.stringify({ok: true, message: "Rebuild angestoßen."}), {
    status: 200,
    headers: {"content-type": "application/json"},
  })
}
