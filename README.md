# Bakken Trekker — GitHub + Supabase

Deze versie is een gewone statische website: geen PWA, Vite of React.

## Belangrijkste wijzigingen
- Zes personen staan hardcoded in `script.js`.
- Hun vaste IDs worden ook gebruikt in de Supabase `people`-tabel.
- Na STOP wordt de tijd eerst getoond.
- Je kiest daarna **Weggooien** of **Opslaan**.
- Alleen **Opslaan** maakt een database-record.
- Het scoreboard wordt na opslaan direct opnieuw uit Supabase geladen.
- Daarnaast luistert het naar Supabase Realtime INSERT/UPDATE/DELETE en laadt dan het scoreboard opnieuw.

## Supabase
1. Open Supabase → SQL Editor.
2. Voer `supabase.sql` uit.
3. Pas de zes namen aan in de INSERT én in `script.js` indien nodig.
4. Zet in `config.js` je project URL en publishable/anon key.
5. Gebruik nooit de `service_role` key in de frontend.

## GitHub
Upload de bestanden naar een repository en kies:
Settings → Pages → Deploy from branch → main → / (root).

De Supabase Realtime-publication moet `measurements` bevatten. Supabase documenteert dat Postgres Changes alleen events ontvangt voor tabellen die aan `supabase_realtime` zijn toegevoegd.