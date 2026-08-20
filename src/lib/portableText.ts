/**
 * Darstellung der Rich-Text-Felder aus Sanity.
 *
 * Der Renderer bringt von Haus aus keinen Serializer für Links mit — ohne den
 * hier definierten würde ein im Studio gesetzter Link als toter Text erscheinen.
 *
 * Beide Funktionen nehmen zusätzlich einen einfachen String entgegen. Die
 * Film-Beschreibungen waren früher reine Textfelder; so bleibt die Seite auch
 * dann heil, wenn Datenbestand und Schema kurzzeitig auseinanderlaufen — etwa
 * zwischen dem Ausrollen und der Migration.
 */
import {toHTML, escapeHTML, uriLooksSafe, type PortableTextComponents} from "@portabletext/to-html"

/** Zeigt die Adresse aus dem Haus heraus? Dann öffnet sie in einem neuen Tab. */
function istExtern(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

const komponenten: PortableTextComponents = {
  marks: {
    link: ({children, value}) => {
      const href = typeof value?.href === "string" ? value.href.trim() : ""
      // uriLooksSafe lässt nur http/https/mailto/tel und relative Adressen durch;
      // damit landet kein „javascript:"-Link im Seitenquelltext.
      if (!href || !uriLooksSafe(href)) return children

      const ziel = escapeHTML(href)
      if (!istExtern(href)) {
        return `<a href="${ziel}" class="pt-link">${children}</a>`
      }
      return (
        `<a href="${ziel}" class="pt-link pt-link-extern" target="_blank" rel="noopener noreferrer">` +
        `${children}<span aria-hidden="true"> ↗</span>` +
        `<span class="sr-only"> (öffnet in neuem Tab)</span></a>`
      )
    },
  },
}

/** Reiner Text aus der Zeit vor der Umstellung: Absätze an Leerzeilen. */
function textZuHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((absatz) => absatz.trim())
    .filter(Boolean)
    .map((absatz) => `<p>${escapeHTML(absatz)}</p>`)
    .join("")
}

/** Rich-Text aus Sanity in HTML — mit klickbaren Links. */
export function richtextZuHtml(inhalt: unknown): string {
  if (!inhalt) return ""
  if (typeof inhalt === "string") return textZuHtml(inhalt)
  return toHTML(inhalt as never, {components: komponenten})
}

/** Nur der nackte Text — für Meta-Angaben und strukturierte Daten. */
export function richtextZuText(inhalt: unknown): string {
  if (!inhalt) return ""
  if (typeof inhalt === "string") return inhalt.trim()
  if (!Array.isArray(inhalt)) return ""

  const absaetze: string[] = []
  for (const block of inhalt) {
    if (!block || typeof block !== "object") continue
    const kinder = (block as {children?: unknown}).children
    if (!Array.isArray(kinder)) continue
    const zeile = kinder
      .map((kind) => (kind && typeof kind === "object" ? String((kind as {text?: unknown}).text ?? "") : ""))
      .join("")
      .trim()
    if (zeile) absaetze.push(zeile)
  }
  return absaetze.join(" ")
}
