import { NextResponse } from "next/server";
import { describeImage } from "@/lib/gemini";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    const mode = form.get("mode") === "detail" ? "detail" : "singkat";

    if (!file || typeof file === "object" && typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Tidak ada foto yang diunggah." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: `Format ${file.type || "tidak dikenal"} tidak didukung. Pakai JPG, PNG, WebP, atau GIF.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Foto terlalu besar (maksimal 5 MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const t0 = Date.now();
    const { text, mock, model } = await describeImage(buffer, file.type, mode);
    return NextResponse.json({
      description: text,
      mock,
      model,
      mode,
      latencyMs: Date.now() - t0,
    });
  } catch (err) {
    console.error("describe failed:", err);
    return NextResponse.json(
      { error: "Gagal mendeskripsikan foto. Periksa koneksi atau kunci API, lalu coba lagi." },
      { status: 500 }
    );
  }
}
