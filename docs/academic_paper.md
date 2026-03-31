# Sequential Greedy Evolutionary Reconstruction

## Abstract
This document describes the current best verified implementation in the repository as of March 31, 2026. The system reconstructs a target image with explicit alpha-blended geometric primitives using a sequential greedy search rather than a joint gradient optimizer. The active pipeline evaluates many candidate shapes in high-error regions, solves each candidate color analytically, hill-climbs only the best candidate geometry, and commits that single shape to the canvas. A 5-minute headless reconstruction of `python/targets/grape.jpg` at `200x200` currently yields `rgb_mse=0.020303`, `ssim=0.45878`, and `gradient_corr=0.59014`, which is the strongest verified result presently kept in the workspace.

## 1. Project Goal
The project aims to approximate arbitrary images with interpretable geometric primitives. Instead of generating a latent image and decoding it, the system constructs the result from a visible sequence of primitive additions. Each accepted step corresponds to a concrete geometric decision:
- where a shape is placed
- how large it is
- how it is rotated
- what color it contributes
- what primitive family it belongs to

This makes the optimization trace inspectable and suitable for studying where reconstruction quality improves or degrades.

## 2. Active Implementation
The current active modules are:
- `python/src/live_refiner.py`
- `python/src/live_optimizer.py`
- `python/src/core_renderer.py`
- `python/run.py`

The current codebase no longer uses the earlier finite-difference live optimizer as its main path. The restored best path is a sequential painter.

## 3. Method

### 3.1 Primitive Dictionary
The renderer currently supports:
- ellipses
- quads
- triangles
- thin strokes

Each primitive is alpha-blended onto the current canvas in order.

### 3.2 Sequential Addition
The central design choice is sequential greedy growth:
1. compute the current error map between target and canvas
2. sample candidate centers from the strongest error regions
3. generate candidate shapes around those centers
4. solve candidate colors analytically from covered target pixels
5. render and score every candidate independently
6. hill-climb the best candidate geometry
7. commit only that single winning shape

This keeps the optimization problem local and bounded instead of jointly updating hundreds of existing parameters.

### 3.3 Analytic Color
Color is not learned with a gradient step in the active best variant. For each candidate shape, the renderer computes its coverage mask and solves the color directly from the target and current canvas under that mask. This removes RGB from the mutation search and makes geometry search much cheaper.

### 3.4 Geometry Search
Geometry is refined with a mutation-based hill climber:
- initial candidate pool sampled from top residual regions
- local mutations over center, size, and rotation
- accept only mutations that reduce RGB MSE

This replaced the earlier slower finite-difference update path for the best current workflow.

## 4. Schedule
The restored best schedule is a three-stage plan:

1. Foundation
   - resolution: `50x50`
   - shapes: `50`
   - types: ellipses and quads
   - candidate search: `42`
   - mutation steps: `84`
2. Structure
   - resolution: `100x100`
   - shapes: `100`
   - types: ellipses, quads, triangles
   - candidate search: `56`
   - mutation steps: `112`
3. Detail
   - resolution: `200x200`
   - remaining shapes
   - types: ellipses, triangles, thin strokes
   - candidate search: `72`
   - mutation steps: `156`

The detail stage uses a high-frequency-biased residual map, while the earlier stages use broader residual targeting.

## 5. Verification

### 5.1 Code Verification
Verified locally with:
- `uv run pytest .\tests\test_live_optimizer.py .\tests\test_live_renderer.py .\tests\test_mse.py .\tests\test_preprocessing.py .\tests\test_refiner_live.py -q`

At the time of this update, that suite passed with `13` tests.

### 5.2 Five-Minute Reconstruction
The currently kept best run in the workspace is:
- run id: `grape_20260331_093438`
- target: `python/targets/grape.jpg`
- resolution: `200x200`
- runtime budget: `5 minutes`
- accepted shapes: `295`

Measured final metrics:
- `rgb_mse = 0.020303`
- `rmse = 0.14249`
- `psnr = 16.924 dB`
- `ssim = 0.45878`
- `lab_mse = 110.403`
- `gradient_mse = 0.00761`
- `gradient_mae = 0.05647`
- `gradient_corr = 0.59014`

Saved artifacts:
- `python/outputs/stage_checkpoints/grape_20260331_093438/stage_detail.png`
- `python/outputs/stage_checkpoints/grape_20260331_093438/run_metrics.json`

### 5.3 Historical Note
During development on March 31, 2026, the same restored three-stage sequential variant previously produced a slightly better one-off `rgb_mse` of about `0.01948`. That historical artifact is no longer present in the cleaned workspace, but it is important because it shows the current code family has already reached a slightly stronger point than the presently kept rerun.

## 6. Discussion
The restored sequential greedy method clearly outperformed the later branches that pushed too hard toward global low-alpha watercolor constraints or edge-heavy routing. The main lesson from the experiments is that the system benefits from:
- strong mid-stage shape capacity
- analytic color instead of color learning
- aggressive candidate search in the detail stage
- simple residual routing rather than over-structured routing

The system still has room to improve. The current best image is recognizable and substantially better than the earlier gradient-based live refiner, but it is still visibly approximate in the grape interiors and leaf boundaries.

## 7. Conclusion
The repository’s current best implementation is a three-stage sequential greedy geometric reconstructor. It is now the code path reflected in the repository documentation, the kept output artifacts, and the retrospective notes. The next practical work should focus on squeezing a bit more quality from this restored version rather than switching to a new optimization family again.
