# Attention-Guided Evolutionary Art

## Overview
This project reconstructs RGB target images (default 200x200, optional 300x300) using an attention-guided evolutionary pipeline. The optimizer uses population-assisted hill climbing with perceptual LAB-space loss, adaptive alpha selection, and geometry strategies for edges, flat regions, and texture.

The live system is interactive and presentation-ready: segmentation overlays, error-map mode cycling, pause/resume, screenshot capture, clean shutdown, and population variant switching are all available during runtime.

## Core Python Pipeline
Main implementation files:
- [python/src/image_loader.py](python/src/image_loader.py): Loads and normalizes images to float32 [0,1].
- [python/src/canvas.py](python/src/canvas.py): White-canvas initialization and copying.
- [python/src/mse.py](python/src/mse.py): RGB and perceptual LAB error metrics and error maps.
- [python/src/polygon.py](python/src/polygon.py): Shape dataclass/enum and candidate generation.
- [python/src/renderer.py](python/src/renderer.py): Rasterization and alpha blending.
- [python/src/preprocessing.py](python/src/preprocessing.py): Phase 1 preprocessing (4-level Gaussian pyramid, LAB MiniBatchKMeans segmentation, skimage Sobel structure+direction maps, complexity scoring, adaptive recommendations).
- [python/src/optimizer.py](python/src/optimizer.py): Main hill-climbing loop with sigmoid multi-scale weighting, adaptive alpha selection, edge-aware shape strategy, splitting, palette refinement, and polygon death/replacement maintenance.
- [python/src/population.py](python/src/population.py): 6-variant threaded population optimizer with barrier-synchronized recombination.
- [python/src/display.py](python/src/display.py): Four-panel interactive live visualization for arbitrary images and population variants.
- [python/demo.py](python/demo.py): Multi-target batch runner, frame/GIF/grid/formula/stat generation.
- [python/run.py](python/run.py): Custom-image entry point with preprocessing summary and live run launch.

## Technical Decisions Applied
- LAB conversion is implemented via scikit-image (`rgb2lab`, `lab2rgb`), not custom conversion.
- Segmentation uses `MiniBatchKMeans` for speed on image-sized data.
- Structure maps are computed with skimage Sobel filters.
- Default resolution is 200x200; 300x300 is opt-in using `--resolution 300`.
- Multi-scale coarse/fine blending uses sigmoid transition: fine weight = `sigmoid(8 * (i/max_iter - 0.4))`.
- Palette refinement runs every 500 accepted polygons (not every fixed number of iterations).
- Population phase uses 6 variants on 6 worker threads.

## Part 2-5 Features Implemented
Phase 2 (Perceptual color matching):
- LAB-space acceptance and guidance metrics.
- Segmentation-aware LAB color sampling with centroid+local blending.
- Adaptive alpha selector over {0.15, 0.40, 0.70}.
- Palette refinement pass every 500 accepted polygons.

Phase 3 (Detail capture strategies):
- Content-aware shape selection from structure magnitude and phase.
- Edge-oriented geometry from local Sobel direction.
- Optional polygon splitting in non-coarse phases.
- Polygon death/replacement maintenance for sparse contribution.

Phase 4 (Population-assisted hill climbing):
- 6 optimizer variants run concurrently on 6 threads.
- Variant personalities (edge emphasis, flat bias, size scaling, aggressive maintenance).
- Barrier-synchronized recombination every 500 iterations.
- Greedy polygon-level parent recombination promotes better primary states.

Phase 5 (Extended live visualization):
- Arbitrary image input flow with crop/letterbox fitting.
- Segmentation overlay toggle on target panel (`S`).
- Error-map mode cycle (`E`): RGB MSE, structure-weighted, perceptual LAB.
- Accept/reject flash bar on evolving canvas.
- Dual MSE lines (primary and best variant) plus acceptance-rate axis.
- ETA-to-target-MSE estimate and continuous stats update.
- Interactive controls: `P`, `S`, `E`, `R`, `Q`, `1/2/3`.

## Targets
Targets are in [python/targets](python/targets):
- [python/targets/heart.png](python/targets/heart.png)
- [python/targets/logo.png](python/targets/logo.png)
- [python/targets/face.png](python/targets/face.png)

## Setup
Requirements:
- Python 3.12+
- Node.js 20+
- `uv` for Python package management

### Python setup
From repo root:

```powershell
Set-Location python
uv sync
```

### Slides setup
From repo root:

```powershell
Set-Location slides
npm install
```

## Testing
Run algorithm tests:

```powershell
Set-Location python
uv run python -m pytest tests/test_mse.py tests/test_renderer.py tests/test_optimizer.py -v
```

Run full test suite including Part 2 and Part 3 behavioral checks:

```powershell
Set-Location python
uv run python -m pytest tests -v
```

## Run the Demo
### Full run (default)
Generates three target runs (5000 iters each), frames, GIF replays, final images, formula image, and comparison grid.

```powershell
Set-Location python
uv run python demo.py
```

### Short verification run
Quick artifact smoke test (200 iters each):

```powershell
Set-Location python
uv run python demo.py --iterations 200
```

## Live Matplotlib Visualization (AI in Action)
Use the custom-image runner to open the 4-panel live Matplotlib window and watch the optimizer evolve the canvas in real time.

Shape cycle used continuously during optimization:
- triangle
- quadrilateral
- ellipse

Run on any image path:

```powershell
Set-Location python
uv run python run.py .\targets\face.png
```

Default uses 200x200 preprocessing. For 300x300 opt-in:

```powershell
uv run python run.py .\targets\face.png --resolution 300
```

Fit-mode behavior for non-square images:
- `--fit-mode auto` (default): prompts crop vs letterbox when interactive; falls back to crop if non-interactive.
- `--fit-mode crop`: center-crop then resize.
- `--fit-mode letterbox`: preserve aspect ratio with padding.

You will see a startup analysis summary (complexity score, recommended polygon budget, detected color regions), then a live window with:
- target image
- attention/error map
- evolving canvas
- live stats + MSE decay

Run all provided sample targets one by one:

```powershell
Set-Location python
uv run python run.py .\targets\heart.png
uv run python run.py .\targets\logo.png
uv run python run.py .\targets\face.png
```

Useful overrides:

```powershell
# manually force polygon budget
uv run python run.py .\targets\face.png --polygons 300

# override coarse-phase max polygon size
uv run python run.py .\targets\face.png --max-size 26

# explicit fit mode and target convergence threshold
uv run python run.py .\targets\face.png --fit-mode letterbox --target-mse 0.01
```

Headless/check mode (no GUI window):

```powershell
uv run python run.py .\targets\face.png --no-display
```

## Generated Outputs
Output artifacts are written to [python/outputs](python/outputs), including:
- Per-target frame snapshots every 50 accepted polygons
- Final canvases (`*_final.jpg`)
- Replays (`*_replay.gif`)
- [python/outputs/comparison_grid.jpg](python/outputs/comparison_grid.jpg)
- [python/outputs/mse_formula.png](python/outputs/mse_formula.png)
- [python/outputs/run_stats.json](python/outputs/run_stats.json)

## Slide Decks
Two presentation formats are provided:

1. Reveal.js web deck (interactive HTML)
2. Native PowerPoint `.pptx` generated with `pptxgenjs`

### Build Reveal.js deck

```powershell
Set-Location slides
npm run build
```

Build output: [slides/dist/index.html](slides/dist/index.html)

### Generate PPTX deck

```powershell
Set-Location slides
npm run pptx
```

Output: [slides/dist/Attention_Guided_Evolutionary_Art_Abdul_Ahad.pptx](slides/dist/Attention_Guided_Evolutionary_Art_Abdul_Ahad.pptx)

### Verify PPTX is populated (non-blank)
This performs structural checks (slide count, text/image/shape presence, font-range sanity):

```powershell
Set-Location python
uv run python scripts/verify_pptx.py ..\slides\dist\Attention_Guided_Evolutionary_Art_Abdul_Ahad.pptx --expected-slides 10
```

## Academic Report
Detailed report (Python component only):
- [docs/academic_report.md](docs/academic_report.md)

Supporting diagrams:
- [docs/figures/architecture_diagram.png](docs/figures/architecture_diagram.png)
- [docs/figures/optimization_flow.png](docs/figures/optimization_flow.png)

## Submission Package
A zip file can be generated after building artifacts:

```powershell
# from repository root
Compress-Archive -Path README.md,docs,python\src,python\targets,python\tests,python\demo.py,python\scripts,python\outputs,slides\dist\index.html,slides\dist\assets,slides\dist\images,slides\dist\Attention_Guided_Evolutionary_Art_Abdul_Ahad.pptx -DestinationPath submission_evolutionary_art.zip -Force
```

## Notes
- The Python algorithm is the main project component.
- Slides are presentation artifacts generated from algorithm outputs.
- Re-running [python/demo.py](python/demo.py) updates outputs consumed by both Reveal and PPTX decks.