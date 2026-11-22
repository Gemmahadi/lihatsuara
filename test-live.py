"""Tes LIVE LihatSuara: upload -> deskripsi ASLI Gemini (gemini-3.5-flash) -> hasil tampil + screenshot.
Bukan demo: gagal kalau teks hasil mengandung 'Mode Demo' atau kosong."""
import sys
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:3100/"
IMG = "/home/hatch/workspace/prize-runs/game-off-2026/geser-tukang-parkir/shots/web-menu.png"
OUT = "/home/hatch/workspace/prize-runs/stackup-nov-2026/shots"

failures = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/home/hatch/workspace/chrome-real/opt/google/chrome/chrome",
                          args=["--no-sandbox"])
    # --- Desktop ---
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(URL, wait_until="networkidle")
    assert "LihatSuara" in pg.title() or "LihatSuara" in pg.content()
    pg.set_input_files('input[type="file"]', IMG)
    pg.wait_for_selector(".preview", timeout=5000)
    pg.click("text=Deskripsikan Foto")
    pg.wait_for_selector(".result", timeout=90000)
    txt = pg.inner_text(".result")
    assert "Mode Demo" not in txt, f"MASIH MODE DEMO: {txt[:200]}"
    assert len(txt.strip()) > 50, f"deskripsi terlalu pendek: {txt[:200]}"
    assert pg.get_by_role("button", name="Bacakan Keras").count() == 1, "tombol Bacakan Keras hilang"
    pg.screenshot(path=f"{OUT}/live-hasil.png")
    print("DESKTOP LIVE OK")
    print("DESKRIPSI ASLI (desktop, singkat):")
    print(txt)
    print("page errors:", errs if errs else "none")
    if errs:
        failures.append(f"desktop console errors: {errs}")
    pg.close()

    # --- Mobile (HP, 390x844), mode Detail ---
    pg = b.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    errs2 = []
    pg.on("pageerror", lambda e: errs2.append(str(e)))
    pg.on("console", lambda m: errs2.append(m.text) if m.type == "error" else None)
    pg.goto(URL, wait_until="networkidle")
    pg.set_input_files('input[type="file"]', IMG)
    pg.wait_for_selector(".preview", timeout=5000)
    pg.click("text=Detail")
    pg.click("text=Deskripsikan Foto")
    pg.wait_for_selector(".result", timeout=90000)
    txt2 = pg.inner_text(".result")
    assert "Mode Demo" not in txt2, f"MASIH MODE DEMO (mobile): {txt2[:200]}"
    assert len(txt2.strip()) > 200, f"mode Detail terlalu pendek: {txt2[:200]}"
    pg.screenshot(path=f"{OUT}/live-mobile.png", full_page=True)
    print("MOBILE LIVE OK (mode Detail)")
    print("DESKRIPSI ASLI (mobile, detail):")
    print(txt2)
    print("page errors:", errs2 if errs2 else "none")
    if errs2:
        failures.append(f"mobile console errors: {errs2}")
    pg.close()
    b.close()

if failures:
    print("FAILURES:", failures)
    sys.exit(1)
print("LIVE TEST: SEMUA LOLOS")
