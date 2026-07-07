import type {APIRoute} from "astro"

export const prerender = false

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FehlerCode =
  | "invalid_email"
  | "missing_email"
  | "brevo_not_configured"
  | "brevo_error"
  | "unbekannt"

function fehler(code: FehlerCode, message: string, status: number): Response {
  return new Response(
    JSON.stringify({ok: false, code, message}),
    {status, headers: {"content-type": "application/json"}}
  )
}

export const POST: APIRoute = async ({request, site}) => {
  let email: string | undefined
  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null)
    email = body?.email
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    email = form.get("email")?.toString()
  }

  if (!email) {
    return fehler("missing_email", "Bitte geben Sie eine E-Mail-Adresse an.", 400)
  }
  email = email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return fehler("invalid_email", "Die E-Mail-Adresse sieht nicht korrekt aus.", 400)
  }

  const apiKey = import.meta.env.BREVO_API_KEY
  const listIdRaw = import.meta.env.BREVO_LIST_ID
  const templateIdRaw = import.meta.env.BREVO_TEMPLATE_ID
  const listId = Number(listIdRaw)
  const templateId = Number(templateIdRaw)

  if (!apiKey || !listIdRaw || !templateIdRaw || !Number.isFinite(listId) || !Number.isFinite(templateId)) {
    return fehler(
      "brevo_not_configured",
      "Der Newsletter-Anbieter ist noch nicht angebunden. Bitte melden Sie sich telefonisch oder per E-Mail.",
      501
    )
  }

  const redirectionUrl = new URL(
    "/newsletter-bestaetigt",
    site ?? "https://modernes-theater-weinheim.vercel.app"
  ).toString()

  try {
    const brevoResponse = await fetch(
      "https://api.brevo.com/v3/contacts/doubleOptinConfirmation",
      {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          includeListIds: [listId],
          templateId,
          redirectionUrl,
        }),
      }
    )

    if (brevoResponse.status === 204 || brevoResponse.ok) {
      return new Response(
        JSON.stringify({ok: true, message: "Bestätigungs-E-Mail unterwegs."}),
        {status: 200, headers: {"content-type": "application/json"}}
      )
    }

    const detail = await brevoResponse.text().catch(() => "")
    console.error("Brevo-Fehler", brevoResponse.status, detail)
    return fehler(
      "brevo_error",
      "Der Newsletter-Anbieter meldet einen Fehler. Bitte später erneut versuchen oder per E-Mail anfragen.",
      502
    )
  } catch (e) {
    console.error("Newsletter-Endpoint Ausnahme", e)
    return fehler("unbekannt", "Unbekannter Serverfehler.", 500)
  }
}
