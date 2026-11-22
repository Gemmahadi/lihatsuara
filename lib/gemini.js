import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Gemini client — satu-satunya tempat yang menyentuh API Gemini.
// Tanpa GEMINI_API_KEY, kembalikan deskripsi MOCK supaya slice tetap bisa
// dites end-to-end (upload -> deskripsi -> TTS). Mock SELALU ditandai
// `mock: true` dan UI menampilkan badge "Mode Demo".
// ---------------------------------------------------------------------------

const MODEL = "gemini-3.5-flash"; // gemini-2.0-flash pensiun (404, 22 Nov); gemini-2.5-flash pensiun untuk pengguna baru (404, 23 Nov); gemini-3.8-flash overload (503) — 3.5-flash terverifikasi 200

const PROMPT_SINGKAT = `Deskripsikan foto ini dalam Bahasa Indonesia yang sederhana, 2-3 kalimat saja.
Sebutkan benda/orang utama, di mana posisinya, dan warna yang paling mencolok.
Jangan pakai bahasa Inggris. Jangan tambahkan penjelasan di luar deskripsi.`;

const PROMPT_DETAIL = `Deskripsikan foto ini secara rinci dalam Bahasa Indonesia yang sederhana dan jelas.
Susun jawabanmu begini:
1. Satu paragraf gambaran keseluruhan: apa yang terjadi di foto ini.
2. Daftar benda/orang yang terlihat, masing-masing dengan posisi dan warna yang mencolok.
3. Kalau ada teks yang terbaca di foto, tuliskan teks itu.
4. Satu kalimat tentang suasana atau hal yang perlu diwaspadai (misalnya tangga, jalan ramai, benda tajam).
Gunakan bahasa yang mudah dipahami orang dengan penglihatan terbatas. Jangan pakai bahasa Inggris.`;

function mockDescription(mode) {
  if (mode === "detail") {
    return [
      "Mode Demo — ini contoh deskripsi, bukan hasil Gemini (kunci API belum dipasang).",
      "",
      "Foto ini memperlihatkan sebuah pemandangan jalanan di siang hari. Di tengah foto ada seorang pria memakai rompi oranye yang sedang berdiri di dekat sebuah mobil merah yang terparkir.",
      "",
      "Benda yang terlihat:",
      "- Mobil merah, di tengah foto, menghadap ke kanan.",
      "- Pria berompi oranye, di sebelah kiri mobil.",
      "- Pohon hijau, di latar belakang sebelah kanan.",
      "",
      "Tidak ada teks yang terbaca di foto ini.",
      "Suasananya tenang, jalanan tampak sepi dan aman untuk berjalan kaki.",
    ].join("\n");
  }
  return "Mode Demo — contoh deskripsi (kunci API belum dipasang). Foto ini memperlihatkan seorang pria berompi oranye berdiri di dekat mobil merah yang terparkir di jalanan yang tenang pada siang hari.";
}

/**
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {"singkat"|"detail"} mode
 * @returns {Promise<{text: string, mock: boolean, model: string}>}
 */
export async function describeImage(imageBuffer, mimeType, mode) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = mode === "detail" ? PROMPT_DETAIL : PROMPT_SINGKAT;

  if (!apiKey) {
    return { text: mockDescription(mode), mock: true, model: "mock (tanpa kunci)" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageBuffer.toString("base64"), mimeType } },
  ]);
  const text = result.response.text().trim();
  if (!text) throw new Error("Gemini mengembalikan deskripsi kosong.");
  return { text, mock: false, model: MODEL };
}
