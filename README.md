# 📸 insta-saver — Instagram Video Downloader Bot

Telegram bot — Instagramdagi video havolalaridan to'g'ridan-to'g'ri videoni yuklab olishga yordam beradi.


Bu loyiha `bun` yordamida ishlaydigan, `grammy` kutubxonasi asosida yozilgan Telegram bot. Foydalanuvchi Instagram post havolasini yuboradi, bot `instagram-url-direct` orqali video manzilini oladi va videoni chatga yuboradi.

## Talablar

-   Bun yoki Node.js >= 18
-   Telegram bot token (environment variable): `TELEGRAM_BOT_TOKEN`.

## O'rnatish

Loyihani klonlash:

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
export TELEGRAM_BOT_TOKEN="<YOUR_TELEGRAM_BOT_TOKEN>"
```

Windows (PowerShell):

```powershell
$env:TELEGRAM_BOT_TOKEN = "<YOUR_TELEGRAM_BOT_TOKEN>"
```

## Ishga tushirish (dev)

```json
"scripts": {
  "dev": "bun --watch index.ts"
}
```

Dev rejimida botni ishga tushirish:

```bash
bun run dev
```

Server boshlangach konsolda `🤖 Bot ishga tushdi...` yozuvi ko'rinadi va bot hozirdan foydalanishga tayyor bo'ladi.

## Qanday ishlaydi — qisqacha

1. Foydalanuvchi `/start` yuborsa, bot xush kelibsiz xabar qaytaradi.
2. Foydalanuvchi matnli xabar yuboradi — agar u `instagram.com` domenini o'z ichiga olmasa, bot so'rab qaytaradi.
3. `instagram-url-direct` paketidan `instagramGetUrl(url)` chaqiriladi.
4. Agar `result.url_list` mavjud bo'lsa, birinchi URL video sifatida chatga yuboriladi.
5. Agar xatolik bo'lsa yoki post shaxsiy bo'lsa, foydalanuvchiga xato haqida xabar yuboriladi.

## Muallif

[@jarkurghan](https://t.me/jarkurghan) — loyiha muallifi.

## Litsenziya

MIT License — istalgan o'zgartirish va foydalanish uchun ochiq.
