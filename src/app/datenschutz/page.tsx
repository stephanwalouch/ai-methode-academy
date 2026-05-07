import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Datenschutzerklärung' }

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

        <Link href="/login" className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-10 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Datenschutzerklärung</h1>
            <p className="mt-2 text-sm text-gray-400">Stand: Mai 2025</p>
          </div>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">1. Verantwortlicher</h2>
            <p className="text-gray-600 leading-relaxed">
              AIM Advisory LLC<br />
              30 N Gould St Ste N<br />
              Sheridan, WY 82801, USA<br />
              E-Mail:{' '}
              <a href="mailto:info@ai-methode.de" className="hover:underline" style={{ color: '#b8922a' }}>
                info@ai-methode.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">2. Welche Daten wir erheben</h2>
            <p className="text-gray-600 leading-relaxed">
              Bei der Nutzung dieser Plattform werden folgende Daten verarbeitet:
            </p>
            <ul className="mt-3 space-y-1.5 text-gray-600 list-disc list-inside leading-relaxed">
              <li>Name und E-Mail-Adresse bei der Registrierung</li>
              <li>Lernfortschritt und abgeschlossene Lektionen</li>
              <li>Zuletzt angesehene Inhalte zur Wiederaufnahme des Lernens</li>
              <li>Notizen zu einzelnen Lektionen</li>
              <li>Technische Daten wie IP-Adresse und Browserinformationen (durch den Hosting-Anbieter)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">3. Zweck der Datenverarbeitung</h2>
            <p className="text-gray-600 leading-relaxed">
              Deine Daten werden ausschließlich für den Betrieb der Lernplattform verwendet:
              Authentifizierung, Fortschrittsverfolgung, Bereitstellung der Kursinhalte sowie
              Kommunikation im Zusammenhang mit deiner Mitgliedschaft. Eine Weitergabe an Dritte
              zu Werbe- oder Marketingzwecken findet nicht statt.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">4. Eingesetzte Dienstleister (Datenverarbeiter)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Für den Betrieb dieser Plattform setzen wir folgende Drittanbieter ein, mit denen
              Auftragsverarbeitungsverträge bestehen:
            </p>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">Supabase (Datenbank & Authentifizierung)</p>
                <p className="mt-1 text-sm text-gray-500">
                  Supabase Inc., San Francisco, CA, USA. Deine Kontodaten, Lernfortschritte und
                  Notizen werden in einer Supabase-Datenbank gespeichert. Supabase ist nach dem
                  EU-U.S. Data Privacy Framework zertifiziert.{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#b8922a' }}>
                    Datenschutzrichtlinie von Supabase
                  </a>
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">Bunny.net (Videohosting & -auslieferung)</p>
                <p className="mt-1 text-sm text-gray-500">
                  BunnyWay d.o.o., Ljubljana, Slowenien (EU). Alle Kursvideos werden über das
                  Content Delivery Network von Bunny.net ausgeliefert. Dabei können technische
                  Nutzungsdaten (z.B. IP-Adresse, Wiedergabedauer) verarbeitet werden.{' '}
                  <a href="https://bunny.net/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#b8922a' }}>
                    Datenschutzrichtlinie von Bunny.net
                  </a>
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">Vercel (Hosting)</p>
                <p className="mt-1 text-sm text-gray-500">
                  Vercel Inc., San Francisco, CA, USA. Die Plattform wird auf Vercel gehostet.
                  Dabei werden technische Zugriffsdaten verarbeitet.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">5. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Wir setzen ausschließlich technisch notwendige Cookies ein, die für den Betrieb der
              Plattform erforderlich sind (Session-Cookies zur Authentifizierung). Analyse- oder
              Marketing-Cookies werden nicht eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">6. Speicherdauer</h2>
            <p className="text-gray-600 leading-relaxed">
              Deine Daten werden gespeichert, solange dein Mitgliedschaftskonto aktiv ist. Nach
              Löschung deines Kontos werden personenbezogene Daten innerhalb von 30 Tagen gelöscht,
              soweit keine gesetzlichen Aufbewahrungspflichten bestehen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">7. Deine Rechte</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Du hast jederzeit das Recht auf:
            </p>
            <ul className="space-y-1.5 text-gray-600 list-disc list-inside leading-relaxed">
              <li>Auskunft über die zu deiner Person gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Zur Ausübung deiner Rechte wende dich an:{' '}
              <a href="mailto:info@ai-methode.de" className="hover:underline" style={{ color: '#b8922a' }}>
                info@ai-methode.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">8. Beschwerderecht</h2>
            <p className="text-gray-600 leading-relaxed">
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
              deiner personenbezogenen Daten zu beschweren.
            </p>
          </section>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <Link href="/impressum" className="hover:underline">Impressum</Link>
        </div>
      </div>
    </div>
  )
}
