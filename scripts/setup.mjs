/**
 * Einrichtungs-Skript: Führt Schema aus, erstellt Admin + Einladungslink
 * Aufruf: node scripts/setup.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { randomBytes } from 'crypto'

// .env.local einlesen
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local')
const env = {}
try {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('❌ .env.local nicht gefunden. Bitte zuerst anlegen.')
  process.exit(1)
}

const SUPABASE_URL     = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(`
❌ Fehlende Umgebungsvariablen in .env.local:
   NEXT_PUBLIC_SUPABASE_URL     → ${SUPABASE_URL ? '✅' : '❌ fehlt'}
   SUPABASE_SERVICE_ROLE_KEY    → ${SERVICE_ROLE_KEY ? '✅' : '❌ fehlt'}

Bitte in .env.local ergänzen:
  SUPABASE_SERVICE_ROLE_KEY=eyJ...  (aus Supabase → Settings → API → service_role)
`)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─── Schritt 1: Schema prüfen ─────────────────────────────────────────────────
async function checkSchema() {
  const { error } = await supabase.from('profiles').select('id').limit(1)
  if (error?.code === '42P01') return false   // Tabelle existiert nicht
  return true
}

// ─── Schritt 2: Admin-User anlegen ───────────────────────────────────────────
async function createAdmin(email, password, name) {
  console.log(`\n📧 Erstelle Admin-Account für ${email}…`)

  // Prüfen ob User bereits existiert
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(u => u.email === email)
  if (existing) {
    console.log('   Nutzer existiert bereits. Setze Admin-Rolle…')
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin', full_name: name })
      .eq('id', existing.id)
    if (error) { console.error('   ❌ Fehler:', error.message); return null }
    console.log('   ✅ Admin-Rolle gesetzt.')
    return existing
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (error) {
    console.error('   ❌ Fehler beim Erstellen des Nutzers:', error.message)
    return null
  }

  // Kurz warten bis Trigger das Profil angelegt hat
  await new Promise(r => setTimeout(r, 1500))

  // Admin-Rolle setzen
  const { error: roleError } = await supabase
    .from('profiles')
    .update({ role: 'admin', full_name: name })
    .eq('id', data.user.id)

  if (roleError) {
    console.error('   ⚠️  Nutzer erstellt, aber Rolle konnte nicht gesetzt werden:', roleError.message)
    console.log('   Manuell im SQL Editor ausführen:')
    console.log(`   UPDATE profiles SET role = 'admin' WHERE email = '${email}';`)
  } else {
    console.log('   ✅ Admin-Account erstellt und Admin-Rolle gesetzt.')
  }

  return data.user
}

// ─── Schritt 3: Einladungslink erstellen ─────────────────────────────────────
async function createInviteToken(adminId) {
  const token = randomBytes(18).toString('base64url')

  const { error } = await supabase.from('invite_tokens').insert({
    token,
    label:      'Erster Einladungslink (Setup)',
    max_uses:   5,
    created_by: adminId ?? null,
  })

  if (error) {
    console.error('   ❌ Fehler beim Erstellen des Tokens:', error.message)
    return null
  }

  return token
}

// ─── Hauptprogramm ────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Mein Kursbereich – Einrichtung\n')
  console.log('Supabase URL:', SUPABASE_URL)

  // Schema prüfen
  console.log('\n📋 Prüfe Datenbankschema…')
  const schemaOk = await checkSchema()

  if (!schemaOk) {
    console.log(`
❌ Datenbanktabellen fehlen noch!

Bitte zuerst das Schema einrichten:
1. Gehe zu: ${SUPABASE_URL.replace('.supabase.co', '')}/project/default/sql
   (oder: Supabase Dashboard → SQL Editor)
2. Öffne die Datei: supabase/schema.sql
3. Kopiere den gesamten Inhalt und führe ihn im SQL Editor aus
4. Führe danach aus: supabase/migrations/001_rpc_functions.sql
5. Dann dieses Skript erneut starten: node scripts/setup.mjs
`)
    process.exit(1)
  }

  console.log('   ✅ Schema vorhanden.')

  // Admin-Daten abfragen
  const args = process.argv.slice(2)
  let email    = args[0]
  let password = args[1]
  let name     = args.slice(2).join(' ') || 'Admin'

  if (!email || !password) {
    console.log(`
Aufruf mit Argumenten:
  node scripts/setup.mjs <email> <passwort> [Name]

Beispiel:
  node scripts/setup.mjs admin@example.com MeinPasswort123 "Max Mustermann"
`)
    process.exit(0)
  }

  if (password.length < 8) {
    console.error('❌ Passwort muss mindestens 8 Zeichen haben.')
    process.exit(1)
  }

  // Admin erstellen
  const adminUser = await createAdmin(email, password, name)

  // Einladungslink erstellen
  console.log('\n🔗 Erstelle Einladungslink…')
  const token = await createInviteToken(adminUser?.id)

  const appUrl = env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Einrichtung abgeschlossen!

Admin-Login:
   E-Mail:   ${email}
   Passwort: ${password}
   URL:      ${appUrl}/login

Einladungslink (für weitere Nutzer):
   ${token ? `${appUrl}/registrieren?token=${token}` : '(konnte nicht erstellt werden – manuell im Admin-Bereich erstellen)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

main().catch(err => {
  console.error('Unerwarteter Fehler:', err)
  process.exit(1)
})
