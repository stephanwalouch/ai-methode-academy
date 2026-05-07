import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Impressum' }

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

        <Link href="/login" className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-10">
          <h1 className="mb-8 text-3xl font-black text-gray-900">Impressum</h1>

          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Anbieter</h2>
            <p className="text-gray-600 leading-relaxed">
              AIM Advisory LLC<br />
              30 N Gould St Ste N<br />
              Sheridan, WY 82801<br />
              USA
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Kontakt</h2>
            <p className="text-gray-600">
              E-Mail:{' '}
              <a href="mailto:info@ai-methode.de" className="hover:underline" style={{ color: '#b8922a' }}>
                info@ai-methode.de
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Inhaltliche Verantwortung</h2>
            <p className="text-gray-600 leading-relaxed">
              Die Inhalte dieser Plattform wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte übernehmen wir keine Gewähr.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Externe Links</h2>
            <p className="text-gray-600 leading-relaxed">
              Diese Plattform enthält Links zu externen Webseiten Dritter. Auf deren Inhalte haben wir
              keinen Einfluss. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werden entsprechende Links
              unverzüglich entfernt.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">Urheberrecht</h2>
            <p className="text-gray-600 leading-relaxed">
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Plattform unterliegen
              dem Urheberrecht. Eine Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung
              des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <Link href="/datenschutz" className="hover:underline">Datenschutzerklärung</Link>
        </div>
      </div>
    </div>
  )
}
