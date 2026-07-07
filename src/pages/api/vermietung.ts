import type {APIRoute} from "astro"

export const prerender = false

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FehlerCode =
  | "invalid_email"
  | "missing_field"
  | "message_too_long"
  | "brevo_not_configured"
  | "brevo_error"
  | "unbekannt"

function fehler(code: FehlerCode, message: string, status: number): Response {
  return new Response(
    JSON.stringify({ok: false, code, message}),
    {status, headers: {"content-type": "application/json"}}
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export const POST: APIRoute = async ({request}) => {
  const contentType = request.headers.get("content-type") ?? ""
  let payload: Record<string, string> = {}

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null)
    if (body && typeof body === "object") payload = body as Record<string, string>
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    for (const [k, v] of form.entries()) payload[k] = v.toString()
  }

  const name = (payload.name ?? payload.Name ?? "").trim()
  const email = (payload.email ?? payload.Email ?? "").trim().toLowerCase()
  const datum = (payload.datum ?? payload.Datum ?? "").trim()
  const raum = (payload.raum ?? payload.Raum ?? "").trim()
  const nachricht = (payload.nachricht ?? payload.Nachricht ?? "").trim()

  if (!name) return fehler("missing_field", "Bitte geben Sie Ihren Namen an.", 400)
  if (!email) return fehler("missing_field", "Bitte geben Sie eine E-Mail-Adresse an.", 400)
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return fehler("invalid_email", "Die E-Mail-Adresse sieht nicht korrekt aus.", 400)
  }
  if (!nachricht) return fehler("missing_field", "Bitte schreiben Sie uns eine Nachricht.", 400)
  if (nachricht.length > 5000) return fehler("message_too_long", "Nachricht zu lang (max. 5000 Zeichen).", 400)

  const apiKey = import.meta.env.BREVO_API_KEY
  const senderEmail = import.meta.env.BREVO_SENDER_EMAIL
  const empfaenger = import.meta.env.BREVO_VERMIETUNG_TO ?? "veranstaltung@kinoweinheim.de"
  const senderName = import.meta.env.BREVO_SENDER_NAME ?? "Modernes Theater Website"

  if (!apiKey || !senderEmail) {
    return fehler(
      "brevo_not_configured",
      "Der E-Mail-Versand ist noch nicht angebunden. Bitte melden Sie sich telefonisch oder per E-Mail.",
      501
    )
  }

  const subject = `Vermietungsanfrage von ${name}`
  const textBody = [
    "Neue Vermietungsanfrage vom Modernen-Theater-Website-Formular:",
    "",
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Wunsch-Datum: ${datum || "keine Angabe"}`,
    `Wunsch-Raum: ${raum || "keine Präferenz"}`,
    "",
    "Nachricht:",
    nachricht,
    "",
    "---",
    "Antworten Sie auf diese E-Mail, um direkt mit dem Anfragenden zu kommunizieren.",
  ].join("\n")

  const htmlBody = [
    "<p><strong>Neue Vermietungsanfrage vom Modernen-Theater-Website-Formular:</strong></p>",
    "<ul>",
    `<li><strong>Name:</strong> ${escapeHtml(name)}</li>`,
    `<li><strong>E-Mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></li>`,
    `<li><strong>Wunsch-Datum:</strong> ${escapeHtml(datum) || "<em>keine Angabe</em>"}</li>`,
    `<li><strong>Wunsch-Raum:</strong> ${escapeHtml(raum) || "<em>keine Präferenz</em>"}</li>`,
    "</ul>",
    "<p><strong>Nachricht:</strong></p>",
    `<p style="white-space: pre-wrap;">${escapeHtml(nachricht)}</p>`,
    "<hr>",
    "<p><em>Antworten Sie auf diese E-Mail, um direkt mit dem Anfragenden zu kommunizieren.</em></p>",
  ].join("\n")

  try {
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {name: senderName, email: senderEmail},
        to: [{email: empfaenger, name: "Vermietung Modernes Theater"}],
        replyTo: {email, name},
        subject,
        textContent: textBody,
        htmlContent: htmlBody,
      }),
    })

    if (brevoResponse.ok) {
      return new Response(
        JSON.stringify({ok: true, message: "Anfrage versendet."}),
        {status: 200, headers: {"content-type": "application/json"}}
      )
    }

    const detail = await brevoResponse.text().catch(() => "")
    console.error("Brevo-Fehler (Vermietung)", brevoResponse.status, detail)
    return fehler(
      "brevo_error",
      "Der E-Mail-Versand meldet einen Fehler. Bitte später erneut versuchen oder direkt per E-Mail anfragen.",
      502
    )
  } catch (e) {
    console.error("Vermietung-Endpoint Ausnahme", e)
    return fehler("unbekannt", "Unbekannter Serverfehler.", 500)
  }
}
