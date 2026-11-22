export const metadata = {
  title: "LihatSuara — Asisten Pencari Visual Bahasa Indonesia",
  description:
    "Foto dari kamera HP dideskripsikan Gemini dalam Bahasa Indonesia, lalu dibacakan keras. Dibuat untuk aksesibilitas low-vision. StackUp November Coding Challenge 2026.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
