from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit(
        "Pillow is required to rebuild helioigma-demo.gif. "
        "Install it outside the repo with `python -m pip install pillow`."
    ) from exc


ROOT = Path(__file__).resolve().parents[1]
FRAME_DIR = ROOT / "demo-frames-v3"
OUTPUT = ROOT / "helioigma-demo.gif"


def main() -> None:
    frames = sorted(FRAME_DIR.glob("[0-9][0-9]-*.png"))
    if len(frames) < 7:
        raise SystemExit(f"Expected at least 7 demo frames in {FRAME_DIR}; found {len(frames)}")

    images = [
        Image.open(frame).convert("P", palette=Image.Palette.ADAPTIVE, colors=96)
        for frame in frames
    ]
    durations = [720] * len(images)
    durations[-1] = 1400
    images[0].save(
        OUTPUT,
        save_all=True,
        append_images=images[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )
    if OUTPUT.stat().st_size < 100000:
        raise SystemExit(f"Generated GIF is unexpectedly small: {OUTPUT.stat().st_size} bytes")
    print(f"Wrote {OUTPUT} from {len(images)} frames ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
