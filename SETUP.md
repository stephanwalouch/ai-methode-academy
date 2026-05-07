# Mein Kursbereich – Einrichtungsanleitung

## 1. Supabase Projekt anlegen

1. Gehe zu [supabase.com](https://supabase.com) → neues Projekt erstellen
2. Unter **SQL Editor**: `supabase/schema.sql` vollständig einfügen und ausführen
3. Danach `supabase/migrations/001_rpc_functions.sql` ausführen
4. Unter **Settings → API**: URL und Anon-Key kopieren
5. Unter **Settings → API**: Service Role Key kopieren (nur serverseitig!)

### Supabase Auth-Einstellungen
- Authentication → Settings → **Site URL** auf deine Domain setzen
- E-Mail-Bestätigung kannst du deaktivieren (empfohlen für geschlossene Plattform):
  Authentication → Settings → **Enable email confirmations** = OFF

---

## 2. Lokale Entwicklung

```bash
# .env.local anlegen
cp .env.local.example .env.local
# Werte aus Supabase eintragen

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
# → http://localhost:3000
```

---

## 3. Ersten Admin-Nutzer anlegen

Da Registrierung nur per Einladungslink möglich ist, musst du den ersten Nutzer direkt in Supabase anlegen:

**Option A – Direkt in Supabase anlegen:**
1. Authentication → Users → **Add user**
2. E-Mail + Passwort eingeben → **Create user**
3. Im SQL Editor ausführen:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'deine@email.de';
```

**Option B – Ersten Einladungslink direkt in DB einfügen:**
```sql
INSERT INTO invite_tokens (token, label, max_uses)
VALUES ('mein-geheimer-start-token', 'Erster Admin', 1);
```
Dann `/registrieren?token=mein-geheimer-start-token` aufrufen, registrieren, dann Admin-Rolle setzen.

---

## 4. Deployment auf Vercel

1. [vercel.com](https://vercel.com) → neues Projekt → GitHub-Repo importieren
2. **Environment Variables** in Vercel eintragen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_BUNNY_LIBRARY_ID`
   - `NEXT_PUBLIC_APP_URL` (deine Vercel-Domain, z.B. `https://mein-kursbereich.vercel.app`)
3. Deploy → fertig!

---

## 5. Bunny.net Videos einbetten

1. Bunny.net Dashboard → Stream → Library erstellen
2. **Library ID** in `.env.local` als `NEXT_PUBLIC_BUNNY_LIBRARY_ID` eintragen
3. Video hochladen → **Video ID** kopieren
4. Im Admin-Bereich bei der Lektion: Video-ID eintragen

Das Video wird dann als `https://iframe.mediadelivery.net/embed/{LIBRARY_ID}/{VIDEO_ID}` eingebettet.

---

## 6. Einladungslinks generieren

1. Als Admin einloggen → Admin-Bereich → Einladungslinks
2. "Neuen Link erstellen" → optional: Name, Ablaufdatum, max. Nutzungen
3. Link kopieren und an neue Mitglieder senden
4. Format: `https://deine-domain.de/registrieren?token=XXX`

---

## Projektstruktur

```
src/
├── app/
│   ├── login/              → Anmeldeseite
│   ├── registrieren/       → Registrierung (nur per Token)
│   ├── (platform)/         → Geschützter Bereich
│   │   ├── dashboard/      → Startseite nach Login
│   │   ├── kurse/          → Kursübersicht + Lektionen
│   │   ├── community/      → Forum
│   │   └── einstellungen/  → Profil & Passwort
│   ├── admin/              → Admin-Bereich (nur für Admins)
│   │   ├── kurse/          → Kursverwaltung
│   │   ├── einladungen/    → Einladungslinks
│   │   └── branding/       → Logo & Farben
│   └── api/invites/        → API für Token-Validierung
├── components/             → Wiederverwendbare Komponenten
├── lib/                    → Supabase-Client, TypeScript-Typen
└── middleware.ts            → Auth-Schutz aller Routen
supabase/
├── schema.sql              → Vollständiges Datenbankschema + RLS
└── migrations/             → Zusätzliche SQL-Funktionen
```

---

## DSGVO-Hinweise

- Alle Daten werden in deinem Supabase-Projekt gespeichert (EU-Region wählen!)
- Keine Tracking-Cookies oder externe Analytics
- Nutzer können Datenlöschung über den Administrator beantragen
- Row Level Security (RLS) ist für alle Tabellen aktiv
- Passwörter werden von Supabase Auth gehasht (bcrypt)
