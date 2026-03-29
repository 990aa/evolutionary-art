# Attention-Guided Evolutionary Art

## Overview
This project reconstructs arbitrary target images using transparent geometric primitives and a staged evolutionary optimizer.

The current system includes a full Phase 7 pipeline:
- Automatic image complexity analysis.
- Automatic polygon budget planning.
- Automatic multi-resolution progressive growth.
- Five-panel live visualization with signed residual diagnostics.
- Interactive runtime steering controls.
- Built-in hard timeout protection so long runs cannot hang indefinitely.

## Environment Setup
Requirements:
- Python 3.12+
- Node.js 20+ (slides only)
- uv

Python environment:

```powershell
Set-Location python
uv sync
```

Slides environment (optional):

```powershell
Set-Location slides
npm install
```

## Main Interface (Phase 7)
Primary run interface:

```powershell
Set-Location python
uv run python run.py path/to/image.jpg [--polygons 400] [--minutes 3] [--resolution 200]
```

Default behavior is automatic:
- Detect image complexity.
- Build staged schedule.
- Execute multi-resolution progressive growth.
- Enforce safe timeout boundaries.

## Phase 7 CLI Options
- `--polygons`: manual polygon budget override.
- `--minutes`: soft runtime budget in minutes.
- `--timeout-seconds`: hard timeout in seconds (default: `minutes*60 + 45`).
- `--resolution`: base square resolution.
- `--fit-mode`: `auto`, `crop`, or `letterbox`.
- `--no-prompt`: disable interactive fit prompt in `auto` mode.
- `--seed`: deterministic seed.
- `--update-interval-ms`: live UI refresh interval (default: `2000`).
- `--close-after-seconds`: auto-close live window after N seconds.
- `--no-display`: headless mode.
- `--iterations`: testing cap for total optimization points.

## Phase 7 Display
The live window uses five panels:
1. Target (static reference).
2. Current reconstruction (full-resolution view).
3. Residual error (signed): red means too dark, blue means too bright.
4. Polygon outlines on white background, size-colored:
   - large: blue
   - medium: green
   - small: red
5. Log-scale MSE curve with vertical markers for:
   - resolution transitions
   - polygon batch additions

## Keyboard Controls
Original controls:
- `P`: pause/resume.
- `S`: segmentation overlay toggle.
- `E`: residual panel mode cycle.
- `R`: save screenshot.
- `Q`: graceful quit.
- `1`/`2`/`3`: set focus view.

Added controls:
- `G`: force immediate polygon growth batch.
- `D`: force immediate residual decomposition and correction pass.
- `V`: cycle focus view (reconstruction, residual, outlines).
- `+` / `-`: adjust softness live.

## Run Modes
Live interactive reconstruction:

```powershell
Set-Location python
uv run python run.py .\targets\internet_landscape.jpg --minutes 3 --resolution 200
```

Headless Phase 7 run:

```powershell
Set-Location python
uv run python run.py .\targets\internet_landscape.jpg --no-display --minutes 3 --resolution 200
```

Hard-timeout-constrained run:

```powershell
Set-Location python
uv run python run.py .\targets\internet_landscape.jpg --minutes 3 --timeout-seconds 170
```

Automated short smoke run:

```powershell
Set-Location python
uv run python run.py .\targets\internet_landscape.jpg --close-after-seconds 8 --iterations 140 --minutes 0.2
```

External timeout wrapper run:

```powershell
Set-Location python
uv run python scripts\interrupt_timeout.py --timeout-seconds 180 -- uv run python run.py .\targets\internet_landscape.jpg --minutes 3
```

Naive vs improved comparison mode:

```powershell
Set-Location python
uv run python compare.py .\targets\internet_landscape.jpg --iterations 800 --no-display --output .\outputs\internet_landscape_compare.png
```

Legacy tri-target demo mode:

```powershell
Set-Location python
uv run python demo.py
```

Final high-resolution evaluation and metric export:

```powershell
Set-Location python
uv run python final_reconstruct_eval.py
```

## Experimental Snapshot
Paired 800-iteration comparison (naive vs improved):

| Target | Naive Final MSE | Improved Final MSE | Improvement Gap |
| --- | ---: | ---: | ---: |
| Portrait | 555.1732 | 114.7067 | 440.4665 |
| Landscape | 208.1470 | 1.9645 | 206.1825 |
| Graphic | 359.3228 | 14.0109 | 345.3118 |

Final 500x500 Phase 7 reconstructions (1000 polygons, 5 minutes):

| Target | MSE | RMSE | PSNR (dB) | SSIM | Accuracy (%) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Portrait | 0.1815 | 0.4260 | 7.41 | 0.2534 | 81.85 |
| Landscape | 0.0650 | 0.2550 | 11.87 | 0.8080 | 93.50 |
| Graphic | 0.1287 | 0.3587 | 8.91 | 0.5148 | 87.13 |

## Testing and Quality
Run tests:

```powershell
Set-Location python
uv run python -m pytest tests -v
```

Run lint/format/type checks:

```powershell
Set-Location python
uvx ruff check --fix
uvx ruff format
uvx ty check
```

## Slides (Optional)
Build reveal.js deck:

```powershell
Set-Location slides
npm run build
```

Generate PPTX:

```powershell
Set-Location slides
npm run pptx
```

## Documentation
- Full paper: `docs/academic_paper.md`
