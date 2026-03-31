# Approach Retrospective

## Project Overview
This project reconstructs a target image with explicit geometric primitives instead of latent image generation. The system starts from a simple canvas, repeatedly chooses a new primitive, rasterizes it with alpha blending, and measures whether that addition reduces reconstruction error against the target.

The goal is twofold:
- produce a recognizable approximation of the input image
- keep the reconstruction process interpretable by expressing the final image as an ordered list of shapes

The active code path for the current best implementation is:
- [python/src/live_refiner.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\src\live_refiner.py)
- [python/src/live_optimizer.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\src\live_optimizer.py)
- [python/src/core_renderer.py](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\src\core_renderer.py)

## Best Approach
The strongest implementation reached in this repository is the restored three-stage sequential greedy painter.

Core idea:
- add one shape at a time
- evaluate many candidate shapes in the current highest-error regions
- solve candidate color analytically from covered target pixels
- hill-climb only the winning geometry
- permanently commit the single best shape

Why it works:
- it reduces the search problem from hundreds of coupled parameters to one local decision at a time
- analytic color removes RGB from the geometry search, which makes candidate evaluation much cheaper
- the staged schedule lets the system first capture broad color masses, then structure, then fine detail
- the detail pass can spend more compute on edge-sensitive residuals without starving the early passes

### Best Schedule
The restored best schedule is:

1. Foundation
   - `50x50`
   - `50` shapes
   - ellipses and quads
   - `42` random candidates per addition
   - `84` hill-climb mutations for the winning candidate
2. Structure
   - `100x100`
   - `100` shapes
   - ellipses, quads, triangles
   - `56` candidates
   - `112` mutations
3. Detail
   - `200x200`
   - remaining budget
   - ellipses, triangles, thin strokes
   - `72` candidates
   - `156` mutations

Important supporting choices:
- the canvas starts from the target mean color
- early stages use broad residual routing
- the detail stage adds a high-frequency bias to prioritize edges and fine structures
- angular shapes are allowed, but not so aggressively that they destroy organic contours

### Best Verified Metrics
The currently kept best restored run in the workspace is:
- run id: `grape_20260331_093438`
- target: `python/targets/grape.jpg`
- runtime: `5 minutes`
- resolution: `200x200`

Measured metrics:
- `rgb_mse = 0.020303`
- `rmse = 0.14249`
- `psnr = 16.924 dB`
- `ssim = 0.45878`
- `lab_mse = 110.403`
- `gradient_mse = 0.00761`
- `gradient_mae = 0.05647`
- `gradient_corr = 0.59014`
- `accepted_polygons = 295`

Kept artifacts:
- [stage_detail.png](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\outputs\stage_checkpoints\grape_20260331_093438\stage_detail.png)
- [run_metrics.json](C:\Users\ahada\Documents\abdulahad\evolutionary-art\python\outputs\stage_checkpoints\grape_20260331_093438\run_metrics.json)

Historical note:
- during development on March 31, 2026, the same three-stage sequential family previously reached a slightly better one-off `rgb_mse` of about `0.01948`
- that earlier artifact was later removed during output cleanup, so the kept reproducible run in the workspace is the `0.020303` result above

## Failed Approaches
The experiments below were valuable, but they moved the code away from the strongest variant.

### 1. Joint Live Optimizer With Shared Rollback
What it did:
- optimized many already-placed shapes together
- used Adam-style state
- combined color and geometry updates under a shared acceptance check

Why it underperformed:
- the optimization problem was too coupled
- a slightly bad geometry update could wipe out a good color update
- many invisible or weakly visible shapes still consumed optimization effort
- the system spent too much compute on maintaining a large parameter state instead of solving one local shape well

Observed result:
- `rgb_mse` around `0.07396`
- `ssim` around `0.15606`
- `gradient_corr` around `-0.0261`

Takeaway:
- global joint optimization looked elegant but was materially worse than sequential greedy addition.

### 2. Grid Seeding Plus Heavy Structured Round Logic
What it did:
- seeded the first stage with a regular grid of shapes
- attempted explicit multi-round schedules with content-aware shape additions
- relied on structured rollout logic and per-round controls

Why it drifted:
- the grid scaffold left visible regularity when later passes did not fully cover it
- the schedule complexity did not translate into better final fit
- too much logic went into orchestration instead of improving candidate quality

Takeaway:
- the grid seed was useful as a diagnostic shortcut, but not as the strongest final image-construction strategy.

### 3. Ultra-Low-Alpha Watercolor Constraint
What it did:
- forced alpha into a low range such as `0.05` to `0.20`
- tried to build everything from many very transparent overlapping primitives

Why it failed:
- the foundation never became solid enough
- dark shadows and large low-frequency masses stayed weak and washed out
- later shapes had to spend too much effort rebuilding missing contrast
- the image looked faint rather than convincingly blocked in

Observed result:
- `rgb_mse = 0.041387`
- `ssim = 0.28848`
- `gradient_corr = 0.52723`

Takeaway:
- low alpha is helpful late, but harmful when applied globally from the start.

### 4. Adaptive Alpha With Bottom-Heavy Budget Split
What it did:
- used stage-specific alpha schedules
- allocated roughly `40/40/20` of shape budget across broad stages
- introduced a later polish pass

Why it still fell short:
- it improved over the fully global watercolor version
- but the extra pass structure and stronger routing heuristics still made the system less direct than the restored best three-stage variant
- some versions pushed too much effort into controlling the schedule instead of improving candidate ranking itself

Observed result:
- `rgb_mse = 0.031983`
- `ssim = 0.31164`
- `gradient_corr = 0.42783`

Takeaway:
- adaptive alpha helped recover contrast, but the overall branch still did not beat the simpler three-stage greedy painter.

### 5. Edge-Heavy Routing
What it did:
- strongly mixed or multiplied residual error with structure guidance
- forced candidate generation toward edges and high-gradient regions

Why it failed:
- it starved the smooth interiors of grapes and the broad background tones
- the optimizer started drawing outlines before the underlying volumes were correct
- the image became structurally suggestive but color-poor

Takeaway:
- structure should be a light guide, not the dominant routing signal.

### 6. Strong Angular Shape Bias
What it did:
- promoted triangles, quads, and strokes on moderate structure values

Why it failed:
- the grape image is dominated by round, organic masses
- aggressive angular shapes turned grape interiors into shards
- contour sharpness improved in isolated spots while global naturalness got worse

Takeaway:
- ellipses must remain the default unless an edge is genuinely sharp and linear.

### 7. Wider Mutation and Mid-Stage Size Expansion
What it did:
- increased mutation jump ranges
- enlarged Stage B and Stage C size ceilings

Why it did not win:
- these changes were not bad on their own
- but inside the more heavily constrained branches, they were not enough to recover the quality lost by overly strong routing and shape-bias decisions
- a wider mutation radius only helps when the search landscape is already being guided toward the right kinds of candidates

Takeaway:
- local tuning helps, but it cannot rescue a branch whose global routing and stage assumptions are off.

## Where The Deviations Happened
The main deviations away from the best version were consistent:

1. Too much global coordination
   - jointly managing many shapes performed worse than solving one strong local addition at a time
2. Too much edge obsession
   - when routing over-prioritized structure, the optimizer neglected the large low-frequency color errors
3. Too much transparency too early
   - underpainting never became solid, and later stages had to fix basic contrast instead of details
4. Too much angularity
   - grapes and leaves need soft, overlapping masses before sharp accents
5. Too much scheduling complexity
   - more knobs did not automatically produce better reconstructions

## Practical Guidance For Future Iteration
If you continue from the restored best branch, the safest next steps are:
- keep the sequential one-shape-at-a-time strategy
- keep analytic color
- keep the three-stage schedule as the base
- tune candidate counts, mutation counts, and residual weighting incrementally
- treat structure guidance as a secondary signal, not the primary objective
- preserve ellipse dominance for organic images

The most important lesson from the experiments is simple: the best results came from a relatively direct greedy reconstructor, not from the more complicated optimization branches that were added later.
