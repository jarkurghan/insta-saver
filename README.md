# 📸 insta-saver — Instagram Video Downloader Bot

Telegram bot — Instagramdagi video havolalaridan to'g'ridan-to'g'ri videoni yuklab olishga yordam beradi.


Bu loyiha `bun` yordamida ishlaydigan, `grammy` kutubxonasi asosida yozilgan Telegram bot. Foydalanuvchi Instagram post havolasini yuboradi, bot `instagram-url-direct` orqali video manzilini oladi va videoni chatga yuboradi.

## Talablar

-   Bun yoki Node.js >= 18
-   Telegram bot token (environment variable): `TELEGRAM_BOT_TOKEN`.

## O'rnatish

Kodni klonlash:

```bash
git clone https://github.com/jarkurghan/insta-saver.git
cd insta-saver
```

Bog'liqliklarni o'rnating (bun tavsiya qilinadi):

```bash
bun install
```

> Agar siz `npm` ishlatayotgan bo'lsangiz:
>
> ```bash
> npm install
> ```

## Muhit o'zgaruvchilar

Bot ishlashi uchun Telegram token kerak. Uni \*.env faylda yoki quyidagicha terminalda o'rnatishingiz mumkin.

Linux / macOS (bash/zsh):

```bash
export TELEGRAM_BOT_TOKEN="<BOT_TOKEN>"
```

Windows (PowerShell):

```powershell
$env:TELEGRAM_BOT_TOKEN = "<BOT_TOKEN>"
```

## Ishga tushirish (dev)

```json
"scripts": {
  "dev": "bun --watch index.ts"
}
```

Botni ishga tushirish:

```bash
bun run dev
```

Server boshlangach konsolda `🤖 Bot ishga tushdi...` yozuvi ko'rinadi va shu bilan bot foydalanishga tayyor bo'ladi.

## Qanday ishlaydi — qisqacha

1. Foydalanuvchi `/start` yuborsa, bot `xush kelibsiz` xabar qaytaradi.
2. Foydalanuvchi matnli xabar yuboradi, ya'ni instagram video havolasini.
3. `instagram-url-direct` paketidan `instagramGetUrl(url)` chaqiriladi va url orqali video foydalanuvchiga qaytariladi.

## Muallif

[@jarkurghan](https://t.me/najmiddin_nazirov) — loyiha muallifi.

## Litsenziya

MIT License — istalgan o'zgartirish va foydalanish uchun ochiq.
