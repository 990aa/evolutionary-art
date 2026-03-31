# Attention-Guided Evolutionary Art

## Overview
This project reconstructs a target image with explicit geometric primitives instead of latent generative sampling. The current best code path is a sequential greedy painter implemented in [python/src/live_refiner.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\src\live_refiner.py) and [python/src/live_optimizer.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\src\live_optimizer.py).

The live system now works by adding one shape at a time:
- score many candidate shapes in the highest-error regions
- solve each candidate color analytically from the target pixels it covers
- hill-climb only the winning shape geometry
- commit that single shape permanently to the canvas

That is the best-performing implementation currently in the repository.

## Best Verified Result
The current kept 5-minute verification run is:
- target: `python/targets/grape.jpg`
- resolution: `200x200`
- runtime: `5 minutes`
- run id: `grape_20260331_093438`

Measured final metrics:
- `rgb_mse = 0.020303`
- `ssim = 0.45878`
- `psnr = 16.924 dB`
- `lab_mse = 110.403`
- `gradient_mse = 0.00761`
- `gradient_mae = 0.05647`
- `gradient_corr = 0.59014`
- `accepted_polygons = 295`

Current kept artifacts:
- Image: [stage_detail.png](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\outputs\stage_checkpoints\grape_20260331_093438\stage_detail.png)
- Metrics: [run_metrics.json](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\outputs\stage_checkpoints\grape_20260331_093438\run_metrics.json)

![Best reconstruction](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\outputs\stage_checkpoints\grape_20260331_093438\stage_detail.png)

Historical note:
During development on March 31, 2026, this same restored three-stage sequential variant previously reached a better one-off `rgb_mse` of about `0.01948`. The currently kept rerun from the restored code is `0.02030`, and that is the artifact still present in the workspace.

## Current Algorithm
The restored best variant uses three stages:

1. Foundation at `50x50`
   - `50` shapes
   - large ellipses and quads
   - `candidate_count=42`
   - `mutation_steps=84`
2. Structure at `100x100`
   - `100` shapes
   - ellipses, quads, and triangles
   - `candidate_count=56`
   - `mutation_steps=112`
3. Detail at `200x200`
   - remaining shapes
   - ellipses, triangles, and thin strokes
   - `candidate_count=72`
   - `mutation_steps=156`

Important implementation details:
- routing uses absolute residual, with high-frequency emphasis only in the detail pass
- shape colors are solved analytically, not by learning rates
- geometry is refined by mutation-based hill climbing, not finite-difference gradients
- the canvas starts from the target mean color, not a random or white field

## Setup
Requirements:
- Python `3.14+`
- `uv`
- Node.js if you want repomix snapshots

```powershell
Set-Location python
uv sync
```

## Main Commands
Run the live UI:

```powershell
Set-Location python
uv run python .\run.py .\targets\grape.jpg --minutes 5 --resolution 200
```

Run headless:

```powershell
Set-Location python
uv run python .\run.py .\targets\grape.jpg --no-display --minutes 5 --resolution 200
```

Repomix snapshot:

```powershell
Set-Location python
uv run python .\scripts\build_python_repomix.py
```

## Testing
Compile:

```powershell
Set-Location python
$env:PYTHONPATH = (Get-Location).Path
uv run python -m compileall .\src .\tests .\run.py .\final_reconstruct_eval.py .\scripts\build_python_repomix.py
```

Regression suite:

```powershell
Set-Location python
$env:PYTHONPATH = (Get-Location).Path
uv run pytest .\tests\test_live_optimizer.py .\tests\test_live_renderer.py .\tests\test_mse.py .\tests\test_preprocessing.py .\tests\test_refiner_live.py -q
```

## Key Files
- [python/src/live_refiner.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\src\live_refiner.py): multi-stage sequential reconstruction driver
- [python/src/live_optimizer.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\src\live_optimizer.py): candidate scoring, analytic color solve, and hill climbing
- [python/src/core_renderer.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\src\core_renderer.py): soft rasterizer and primitive compositing
- [python/run.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\run.py): CLI entry point
- [docs/academic_paper.md](C:\Users\ahada\Documents\abdulahad\evolutionary-art\docs\academic_paper.md): current implementation report
- [docs/approach_retrospective.md](C:\Users\ahada\Documents\abdulahad\evolutionary-art\docs\approach_retrospective.md): best approach and failed-approach analysis
