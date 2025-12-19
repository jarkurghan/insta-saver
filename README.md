# 📸 insta-saver — Instagram Video Downloader Bot

Telegram bot — Instagramdagi video havolalaridan to'g'ridan-to'g'ri videoni yuklab olishga yordam beradi.

Ushbu bot telegram foydalanuvchilariga instagram-dan video va reelslarni osonlik bilan yuklab olish imkonini beradi. Foydalanuvchi ma'lumotlari **supabase** ma'lumotlar bazasida saqlanadi va yangi foydalanuvchilar haqida adminga xabar yuboriladi.

## ✨ Xususiyatlari

-   **Video Yuklash:** Instagram havolasini yuborish orqali videoni to'g'ridan-to'g'ri telegramda olish.
-   **Foydalanuvchilarni Boshqarish:** Supabase integratsiyasi orqali foydalanuvchilarni bazaga saqlash.
-   **UTM Tracking:** Foydalanuvchilar qaysi manbadan kelganini kuzatish (UTM parametrlar orqali).
-   **Admin Bildirishnomalari:** Yangi foydalanuvchi qo'shilganda adminga ma'lumot yuborish.

## 🛠 Texnologiyalar

-   [grammY](https://grammy.dev/) - Telegram bot framework.
-   [Supabase](https://supabase.com/) - Ma'lumotlar bazasi.
-   [Axios](https://axios-http.com/)
-   [TypeScript](https://www.typescriptlang.org/)

## 🚀 O'rnatish va Ishga tushirish

1.  **Reponi klonlang:**

    ```bash
    git clone [https://github.com/jarkurghan/insta-saver.git](https://github.com/jarkurghan/insta-saver.git)
    cd insta-saver
    ```

2.  **paketlarni o'rnating:**

    ```bash
    npm install
    ```

3.  **Muhit o'zgaruvchilarini sozlang (`.env` fayli yarating):**

    ```env
    TELEGRAM_BOT_TOKEN=...
    SUPABASE_URL=...
    SUPABASE_KEY=...
    ADMIN_CHAT_ID=...
    TABLE_NAME=...
    ```

4.  **Botni ishga tushiring:**
    ```bash
    npm start
    ```

## 📊 Ma'lumotlar Bazasi Tuzilishi (Supabase)

Supabase-da `TABLE_NAME` (masalan: `users`) jadvalini quyidagi ustunlar bilan yarating:

-   `tg_id` (int8/unique) - Foydalanuvchi IDsi.
-   `first_name` (text) - Ismi.
-   `last_name` (text, nullable) - Familiyasi.
-   `username` (text, nullable) - Telegram username.

## 📝 Ishlash tartibi

1.  Foydalanuvchi `/start` bosganda, bot uning ma'lumotlarini bazada bor-yo'qligini tekshiradi.
2.  Agar yangi foydalanuvchi bo'lsa, adminga xabar yuboradi.
3.  Foydalanuvchi Instagram havolasini yuborganida, bot `kkinstagram.com` proksi xizmati orqali videoni yuklab oladi va foydalanuvchiga yuboradi.

## ⚠️ Eslatma

Agar Instagram o'z algoritmlarini o'zgartirsa, yuklash jarayonida uzilishlar bo'lishi mumkin.

---

## Muallif

[@jarkurghan](https://t.me/najmiddin_nazirov) — loyiha muallifi.
[@devkokand](https://t.me/devkokand) — dasturchi.

## Litsenziya

MIT License — istalgan o'zgartirish va foydalanish uchun ochiq.
