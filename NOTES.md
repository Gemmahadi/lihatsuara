# StackUp November Coding Challenge — NOTES

Sumber: https://hackathon.stackup.dev/web/events/stackup-november-coding-challenge
Dibaca penuh: 22 Nov 2026 ~23:13 WIB (via browser.open, crawl <1 mnt).

## Fakta event (terverifikasi)
- Tema: **"From Words to Worlds – Multimodal GenAI"** — gabungkan text / speech / visuals.
- Statement yang dipilih: **#2 Create a Visual Search Assistant** — "Combine image-to-text
  capabilities with speech synthesis to create a tool that visually scans objects in a photo
  and describes them audibly — perfect for accessibility or on-the-go learning."
  (Statement #1 Meeting Insights Generator DITOLAK — terlalu generik, mirip Ringkasku yang sudah ada.
  Statement #3 Open category jadi cadangan.)
- Timeline: registrasi 1–24 Nov; submit buka 5 Nov 12:00 GMT+8; **submit TUTUP 25 Nov 12:00 GMT+8
  = 25 Nov 11:00 WIB**; juri 25–29 Nov; pemenang 30 Nov.
- Eligibilitas: semua umur, tim 1–5 orang, semua negara ("excluding standard exceptions" —
  tidak ada larangan Indonesia tertulis).
- Hadiah total $700, top 5: $250 / $180 / $130 / $80 / $60.

## Syarat submit (terverifikasi)
- Link repo GitHub, terorganisir rapi; **commit terakhir harus dalam periode submit**.
- Video 1 menit (atau lebih pendek) — OPSIONAL, **SKIP (video HOLD Adi)**.
- README WAJIB berisi:
  - penjelasan workflow detail (input → output) + bagaimana modalitas berinteraksi;
  - panduan instalasi langkah demi langkah (termasuk API pihak ketiga / dependensi);
  - screenshot atau GIF;
  - deploy live opsional (nilai tambah).
- Tie-breaker opsional: metrik performa / akurasi / optimasi kreatif — dokumentasikan di README.

## Bobot juri (terverifikasi)
- Functionality & Reliability 30% | Usability/UI 25% | Quality of Documentation 25% |
  Innovation & Creativity 10% | Code Quality & Organization 10%.
- Code quality menyebut eksplisit: **Next.js + Gemini** — stack yang diharapkan.

## Angle kita (DISETUJUI Adi 22 Nov 23:12)
**"LihatSuara" — Visual Search Assistant berbahasa Indonesia untuk low-vision.**
Foto dari kamera HP → Gemini (multimodal) mendeskripsikan isi foto dalam Bahasa Indonesia →
dibacakan keras (TTS). 3 modalitas: gambar masuk, teks, suara keluar.
Pembeda: aksesibilitas + Bahasa Indonesia (entri lain umumnya berbahasa Inggris).
Fitur: upload / kamera HP / drag-drop, 2 mode deskripsi (Singkat / Detail), TTS id-ID
(speechSynthesis browser), riwayat deskripsi (localStorage).

## Keputusan teknis
- Stack: Next.js (App Router) + @google/generative-ai (Gemini). Bahasa UI: Indonesia.
- KUNCI GEMINI BELUM ADA (urusan Adi). Bangun dengan **mock Gemini client** untuk testing:
  `GEMINI_API_KEY` kosong → API route mengembalikan deskripsi mock (diberi label jelas di UI
  "Mode Demo — tanpa kunci Gemini"). Key asli tinggal masuk via env var; JANGAN tulis key ke repo.
- .env.example disertakan; .env.local di .gitignore.
- Pola kerja: playable slice dulu (upload → deskripsi → TTS end-to-end), baru polish → v2.
- DILARANG: daftar StackUp, bikin kunci Gemini, submit, sentuh akun Adi, bayar apa pun.

## Status build
- [x] 22 Nov 23:13 — riset event selesai, angle terkonfirmasi = statement #2 persis.
- [x] Slice v1: upload → deskripsi (mock) → TTS — LOLOS Playwright desktop + HP, 0 console error.
- [x] Gemini real client (env var) + mode Singkat/Detail + riwayat + tombol "Coba foto contoh".
- [x] Polish UI + screenshot README + README lengkap + favicon.
- [x] 22 Nov 23:17 — Adi daftar StackUp (gemmahadi@gmail.com) + kirim kunci Gemini.
- [x] 22 Nov 23:2x — VERIFIKASI KUNCI (transient, tidak disimpan di file mana pun):
  kunci ASLI dikenali Google (kunci palsu → 400 API_KEY_INVALID; kunci Adi → 403),
  TAPI ditolak service: `403 PERMISSION_DENIED / ACCESS_DENIED` pada
  `generativelanguage.googleapis.com` — untuk SEMUA model (list + generateContent,
  gemini-2.0-flash + gemini-2.5-flash). Artinya: Generative Language API belum di-enable
  di project kunci itu, ATAU kunci dibatasi (API restrictions) ke API lain.
  Perbaikan ada di tangan Adi (akun Google): Cloud Console → APIs & Services → Library →
  "Generative Language API" → Enable; atau buat kunci baru tanpa API restrictions.
  Model di kode diganti gemini-2.0-flash → gemini-2.5-flash (2.0-flash pensiun).
- [x] Git init + commit lokal 1787b3c (TANPA push).
- [x] 23 Nov 00:32 — KUNCI BARU Adi terverifikasi JALAN (oleh parent, transient): API enabled, tidak ada lagi 403.
  Model diganti gemini-2.5-flash → gemini-3.5-flash (2.5-flash 404 "no longer available to new users";
  gemini-3.8-flash 503 overload — jangan dipakai; 3.5-flash generateContent 200).
- [x] 23 Nov 00:3x — TES LIVE end-to-end pakai API asli LOLOS: Playwright desktop + HP, deskripsi ASLI
  Gemini tampil (bukan demo), badge "Dideskripsikan oleh Gemini (gemini-3.5-flash)", tombol Bacakan Keras
  ada, 0 console error. Screenshot: shots/live-hasil.png + shots/live-mobile.png.
- [ ] Sisa di tangan Adi: push repo + submit form StackUp sebelum Selasa 25 Nov 11:00 WIB.
