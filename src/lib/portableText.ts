/**
 * Darstellung der Rich-Text-Felder aus Sanity.
 *
 * Der Renderer bringt von Haus aus keinen Serializer für Links mit — ohne den
 * hier definierten würde ein im Studio gesetzter Link als toter Text erscheinen.
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

/** Rich-Text aus Sanity in HTML — mit klickbaren Links. */
export function richtextZuHtml(blocks: unknown): string {
  if (!blocks) return ""
  return toHTML(blocks as never, {components: komponenten})
}
