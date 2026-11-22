"""Slice test LihatSuara: upload -> deskripsi (mock) -> hasil tampil + screenshot."""
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
    pg.wait_for_selector(".result", timeout=15000)
    txt = pg.inner_text(".result")
    assert "Mode Demo" in txt or "pria berompi" in txt, f"hasil tak terduga: {txt[:120]}"
    assert pg.inner_text("body").count("Mode Demo") >= 1, "badge Mode Demo hilang"
    # tombol TTS ada (get_by_role = pencocokan tepat per tombol)
    assert pg.get_by_role("button", name="Bacakan Keras").count() == 1, "tombol Bacakan Keras hilang"
    pg.screenshot(path=f"{OUT}/desktop-hasil.png")
    print("DESKTOP OK:", txt[:100].replace("\n", " "))
    print("page errors:", errs if errs else "none")
    if errs:
        failures.append(f"desktop console errors: {errs}")
    pg.close()

    # --- Mobile (HP, 390x844) ---
    pg = b.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    pg.goto(URL, wait_until="networkidle")
    pg.set_input_files('input[type="file"]', IMG)
    pg.wait_for_selector(".preview", timeout=5000)
    # mode Detail
    pg.click("text=Detail")
    pg.click("text=Deskripsikan Foto")
    pg.wait_for_selector(".result", timeout=15000)
    txt2 = pg.inner_text(".result")
    assert "Benda yang terlihat" in txt2, f"mode Detail tidak rinci: {txt2[:120]}"
    pg.screenshot(path=f"{OUT}/mobile-hasil.png", full_page=True)
    print("MOBILE OK (mode Detail):", txt2[:100].replace("\n", " "))
    pg.close()
    b.close()

if failures:
    print("FAILURES:", failures)
    sys.exit(1)
print("SLICE TEST: SEMUA LOLOS")
