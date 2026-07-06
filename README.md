# Immo-app

Digitale plaatsbeschrijvingen voor immokantoren: kamers en elementen vastleggen, foto's uploaden, automatisch een conditiebeoordeling laten genereren via Claude vision, en een PDF-rapport exporteren.

## Starten

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Zonder `ANTHROPIC_API_KEY` in `.env` werkt de app volledig, maar valt de automatische foto-analyse terug op een placeholder die je manueel invult. Met een geldige key stelt Claude na elke foto-upload automatisch een conditie en beschrijving voor.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + SQLite
- Claude (vision) voor automatische conditiebeoordeling
- `@react-pdf/renderer` voor PDF-export
