from __future__ import annotations

from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "cover.png"
WIDTH = 1000
HEIGHT = 420


def font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "arialbd.ttf" if bold else "arial.ttf",
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_centered(draw: ImageDraw.ImageDraw, xy: tuple[float, float], text: str, face, fill: str) -> None:
    bbox = draw.textbbox((0, 0), text, font=face)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text((xy[0] - w / 2, xy[1] - h / 2), text, font=face, fill=fill)


def draw_wheel(draw: ImageDraw.ImageDraw) -> None:
    cx, cy = 735, 205
    outer = 138
    middle = 88
    inner = 34
    gold = "#ffd24a"
    blue = "#61b8ff"
    green = "#a6f7c8"
    red = "#ff695c"
    white = "#f9f7ef"
    dark = "#211f1f"
    glyphs = ["SOL", "XOR", "LUX", "BIN", "SOL", "XOR", "LUX", "BIN"]
    node_font = font(24, bold=True)

    draw.ellipse((cx - outer, cy - outer, cx + outer, cy + outer), outline=gold, width=5)
    draw.ellipse((cx - middle, cy - middle, cx + middle, cy + middle), outline=green, width=3)
    draw.ellipse((cx - inner, cy - inner, cx + inner, cy + inner), outline=red, width=3)
    draw.ellipse((cx - 13, cy - 13, cx + 13, cy + 13), fill=gold, outline=red, width=2)
    for radius, color in [(outer - 35, blue), (middle + 2, green), (inner + 18, red)]:
        draw.arc((cx - radius, cy - radius, cx + radius, cy + radius), 25, 335, fill=color, width=2)
    for i, glyph in enumerate(glyphs):
        angle = -pi / 2 + (2 * pi * i / len(glyphs))
        x = cx + cos(angle) * (outer - 2)
        y = cy + sin(angle) * (outer - 2)
        draw.line((cx, cy, x, y), fill=white, width=2)
        rx, ry = 40, 22
        draw.rounded_rectangle((x - rx, y - ry, x + rx, y + ry), radius=24, fill=dark, outline=gold, width=2)
        draw_centered(draw, (x, y - 1), glyph, node_font, white)


def build() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), "#0b1021")
    draw = ImageDraw.Draw(img)

    draw.polygon([(0, 0), (300, 0), (185, HEIGHT), (0, HEIGHT)], fill="#24211f")
    draw.polygon([(790, 0), (1000, 0), (1000, HEIGHT), (930, HEIGHT)], fill="#102a31")
    draw.polygon([(285, 0), (790, 0), (930, HEIGHT), (185, HEIGHT)], fill="#0f1324")

    draw.text((66, 72), "HELIOIGMA", font=font(68, bold=True), fill="#ffd24a")
    draw.text((70, 150), "45s Turing-wheel puzzle", font=font(34, bold=True), fill="#f9f7ef")
    draw.text((70, 205), "Align logic before nightfall.", font=font(25), fill="#d6d7df")
    draw.rounded_rectangle((70, 255, 492, 310), radius=6, fill="#102a31", outline="#ffd24a", width=2)
    draw.text((94, 270), "Logic aligned. Daylight sealed.", font=font(22, bold=True), fill="#d7fbe2")
    draw.text((70, 350), "DEV June Solstice Game Jam", font=font(21, bold=True), fill="#7bcaff")
    draw.text((70, 378), "Best Ode to Alan Turing", font=font(21, bold=True), fill="#f9f7ef")

    draw_wheel(draw)
    img.save(OUTPUT)
    print(f"Built {OUTPUT.name}: {WIDTH}x{HEIGHT}")


if __name__ == "__main__":
    build()
