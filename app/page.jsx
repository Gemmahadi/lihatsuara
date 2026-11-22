"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./globals.css";

const HISTORY_KEY = "lihatsuara-history-v1";
const MAX_HISTORY = 5;

function pickIndonesianVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("id")) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().includes("ind")) ||
    null
  );
}

function makeThumbnail(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 144;
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, size / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState("singkat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
    // Muat daftar suara lebih awal supaya TTS id-ID siap saat dibutuhkan.
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => window.speechSynthesis?.cancel();
  }, []);

  const chooseFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("File yang dipilih bukan gambar.");
      return;
    }
    setError("");
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const describe = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("mode", mode);
      const res = await fetch("/api/describe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendeskripsikan foto.");
      setResult(data);
      const thumb = await makeThumbnail(file);
      const item = { thumb, text: data.description, mock: data.mock, time: new Date().toISOString() };
      setHistory((h) => {
        const next = [item, ...h].slice(0, MAX_HISTORY);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    } catch (e) {
      setError(e.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (!("speechSynthesis" in window)) {
      setError("Peramban ini tidak mendukung pembacaan suara (speechSynthesis).");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickIndonesianVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else u.lang = "id-ID";
    u.rate = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <main>
      <header>
        <h1>LihatSuara</h1>
        <p>Foto dari kamera HP, dideskripsikan dalam Bahasa Indonesia, lalu dibacakan keras.</p>
      </header>

      <section className="card" aria-label="Unggah foto">
        <h2>1. Pilih foto</h2>
        <div
          className={`dropzone${drag ? " drag" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Pilih foto dari kamera atau galeri, atau seret foto ke sini"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); chooseFile(e.dataTransfer.files?.[0]); }}
        >
          <strong>{file ? "Ganti foto" : "Ketuk untuk foto / pilih dari galeri"}</strong>
          <p>Di HP, tombol ini membuka kamera. Bisa juga seret foto ke sini.</p>
          <p>JPG, PNG, WebP, GIF — maksimal 5 MB.</p>
        </div>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => chooseFile(e.target.files?.[0])}
        />
        <div className="btn-row">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={async () => {
              try {
                const res = await fetch("/sample.jpg");
                const blob = await res.blob();
                chooseFile(new File([blob], "contoh.jpg", { type: "image/jpeg" }));
              } catch { setError("Gagal memuat foto contoh."); }
            }}
          >
            Coba foto contoh
          </button>
        </div>
        {preview && <img className="preview" src={preview} alt="Foto yang dipilih" />}

        <h2 style={{ marginTop: 20 }}>2. Pilih cara deskripsi</h2>
        <div className="modes" role="group" aria-label="Mode deskripsi">
          <button className="mode" aria-pressed={mode === "singkat"} onClick={() => setMode("singkat")}>
            Singkat<small>2–3 kalimat, cepat didengar</small>
          </button>
          <button className="mode" aria-pressed={mode === "detail"} onClick={() => setMode("detail")}>
            Detail<small>Rinci: benda, posisi, teks, suasana</small>
          </button>
        </div>

        <button className="btn btn-primary" onClick={describe} disabled={!file || loading}>
          {loading ? "Sedang mendeskripsikan…" : "Deskripsikan Foto"}
        </button>
        {error && <div className="error" role="alert">{error}</div>}
      </section>

      {result && (
        <section className="card" aria-label="Hasil deskripsi">
          <h2>3. Hasil deskripsi</h2>
          {result.mock
            ? <span className="badge badge-warn">Mode Demo — contoh deskripsi, kunci Gemini belum dipasang</span>
            : <span className="badge badge-ok">Dideskripsikan oleh Gemini ({result.model})</span>}
          <div className="result">{result.description}</div>
          <div className="btn-row">
            {speaking
              ? <button className="btn btn-secondary" onClick={stopSpeaking}>Berhenti Membaca</button>
              : <button className="btn btn-secondary" onClick={() => speak(result.description)}>Bacakan Keras</button>}
            <button
              className="btn btn-secondary"
              onClick={() => { navigator.clipboard?.writeText(result.description); }}
            >
              Salin Teks
            </button>
          </div>
          <p className="meta">
            Mode: {result.mode === "detail" ? "Detail" : "Singkat"} · Waktu proses: {result.latencyMs} ms
            {result.mock ? " · Pasang GEMINI_API_KEY di .env.local untuk deskripsi asli." : ""}
          </p>
        </section>
      )}

      {history.length > 0 && (
        <section className="card" aria-label="Riwayat">
          <h2>Riwayat terakhir</h2>
          {history.map((h, i) => (
            <div className="history-item" key={h.time + i}>
              {h.thumb && <img src={h.thumb} alt="" />}
              <div>
                <p>{h.text.length > 180 ? h.text.slice(0, 180) + "…" : h.text}</p>
                <time>{new Date(h.time).toLocaleString("id-ID")}</time>
                {" "}
                <button className="btn btn-secondary" style={{ minHeight: 36, padding: "4px 12px", fontSize: ".9rem" }} onClick={() => speak(h.text)}>
                  Bacakan
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <footer>
        LihatSuara — Visual Search Assistant Bahasa Indonesia · StackUp November Coding Challenge 2026
        <br />Gambar → Teks (Gemini) → Suara (Text-to-Speech)
      </footer>
    </main>
  );
}
