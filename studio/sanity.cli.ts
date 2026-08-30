import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'mooch5bz',
    dataset: 'production'
  },
  deployment: {
    appId: 'n29cckybxgcu3s8p0m9aduwa',
    /**
     * Auto-Updates bewusst AUS (Entscheidung 30.08.2026).
     *
     * Mit `autoUpdates: true` laedt Sanity beim Oeffnen immer die neueste
     * Studio-Version und legt sie ueber das hochgeladene Paket. Waechst der
     * Abstand zwischen beiden zu weit, startet das Studio nicht mehr —
     * genau das ist am 30.08.2026 passiert (Paket 6.4.0 vom 20.08. gegen
     * Laufzeit 6.11.0 → weisse Seite, ohne dass jemand etwas geaendert hat).
     *
     * Das Studio soll spaeter vom Kino ohne Entwickler bedient werden, darum
     * hat Stabilitaet Vorrang vor Aktualitaet: Es laeuft nun exakt in der
     * Version, die zuletzt per `npx sanity deploy` hochgeladen wurde.
     *
     * Preis dafuer: Sicherheits- und Fehlerkorrekturen kommen nur noch beim
     * bewussten Neu-Hochladen an. Darum gehoert ein regelmaessiger
     * Wartungstermin dazu (Versionen pruefen, lokal testen, neu deployen).
     *
     * Wieder einschalten: hier auf `true` setzen und neu deployen. Die
     * frueheren CLI-Flaggen `--auto-updates` / `--no-auto-updates` sind
     * abgekuendigt; allein dieser Wert entscheidet.
     */
    autoUpdates: false,
  },
})
