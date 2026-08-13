#!/usr/bin/env python3
"""Generate 股小白 PWA icons (solid square, no alpha -> iOS-safe)."""
import math
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "icons")
os.makedirs(OUT, exist_ok=True)

FONT_CANDIDATES = [
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/Library/Fonts/Arial Unicode.ttf",
    "/System/Library/Fonts/Supplemental/Songti.ttc",
]
FONT = next((f for f in FONT_CANDIDATES if os.path.exists(f)), None)

TOP = (30, 99, 214)     # #1E63D6
BOTTOM = (46, 160, 230)  # #2EA0E6
WHITE = (255, 255, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_base(size):
    img = Image.new("RGB", (size, size), TOP)
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        c = lerp(TOP, BOTTOM, t)
        for x in range(size):
            px[x, y] = c
    return img


def draw_glyph(draw, size, font):
    # center "股" in white
    fs = int(size * 0.62)
    try:
        f = ImageFont.truetype(font, fs)
    except Exception:
        f = ImageFont.load_default()
    txt = "股"
    bbox = draw.textbbox((0, 0), txt, font=f)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = size * 0.30 - bbox[1] + (size - h) * 0 + size * 0.02
    draw.text((x, y), txt, font=f, fill=WHITE)


def draw_sparkline(draw, size):
    # ascending white sparkline with arrowhead, lower portion
    pts = [(0.16, 0.82), (0.34, 0.74), (0.52, 0.78), (0.70, 0.62), (0.86, 0.55)]
    p = [(int(x * size), int(y * size)) for x, y in pts]
    lw = max(6, int(size * 0.028))
    draw.line(p, fill=WHITE, width=lw, joint="curve")
    # nodes
    r = max(4, int(size * 0.012))
    for (x, y) in p[:-1]:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)
    # arrowhead at last point
    ex, ey = p[-1]
    ang = math.atan2(p[-1][1] - p[-2][1], p[-1][0] - p[-2][0])
    a = 0.5
    for da in (a, -a):
        ax = ex - int(math.cos(ang + da) * size * 0.06)
        ay = ey - int(math.sin(ang + da) * size * 0.06)
        draw.line([(ex, ey), (ax, ay)], fill=WHITE, width=lw)


def compose(size):
    img = make_base(size)
    d = ImageDraw.Draw(img)
    if FONT:
        draw_glyph(d, size, FONT)
    draw_sparkline(d, size)
    return img


def main():
    base = compose(512)
    base.save(os.path.join(OUT, "icon-512.png"))
    # standard sizes
    for s in (192, 180, 152, 167):
        compose(s).save(os.path.join(OUT, f"icon-{s}.png"))
    # maskable: full-bleed bg already; save a 512 copy
    base.save(os.path.join(OUT, "maskable-512.png"))
    print("icons written to", os.path.abspath(OUT))
    print("font:", FONT)


if __name__ == "__main__":
    main()
