# Attention-Guided Evolutionary Art: An Academic Report

## Abstract
This report presents a population-assisted evolutionary image reconstruction system that approximates RGB targets at default 200x200 resolution (with 300x300 opt-in) using transparent geometric primitives. Optimization is driven by perceptual LAB-space error, attention-guided proposal sampling, adaptive alpha selection, and phase-aware geometry strategies. A 6-variant threaded population explores complementary search behaviors and periodically recombines best-performing states. The interface provides a four-panel interactive visualization with segmentation and error-mode toggles, variant switching, and progress estimation. Experiments and tests show stable convergence, measurable improvement from population diversity, and interpretable intermediate states.

## 1. Introduction
Generative approximation with simple primitives is a useful educational setting for optimization, rendering, and model interpretability. The system here is intentionally small but expressive:
- Small spatial resolution for fast iteration.
- Explicit objective (MSE) for measurable progress.
- Attention-guided candidate proposals for computational efficiency.

Unlike end-to-end neural reconstruction, this framework makes each accepted update visible and interpretable: every retained shape has a direct causal contribution to error reduction.

## 2. Problem Formulation
Given target image $T \in [0,1]^{H \times W \times 3}$ and current canvas $C$, optimize a sequence of shapes $\{s_k\}$ such that rendered canvas $\hat{C}$ minimizes MSE:

$$
\operatorname{MSE}(T, C) = \frac{1}{3HW}\sum_{y=1}^{H}\sum_{x=1}^{W}\sum_{c=1}^{3} (T_{y,x,c} - C_{y,x,c})^2
$$

The per-pixel error map is:

$$
E_{y,x} = \sum_{c=1}^{3}(T_{y,x,c} - C_{y,x,c})^2
$$

This map is Gaussian-smoothed and normalized to a probability distribution for proposal sampling.

## 3. System Architecture
The pipeline is modular and testable.

![System architecture](figures/architecture_diagram.png)

Core modules:
- `image_loader.py`: RGB conversion, resize, float32 normalization.
- `canvas.py`: white-canvas initialization and deep copy.
- `mse.py`: RGB and perceptual LAB metrics + error maps.
- `polygon.py`: content-aware shape sampling and LAB-grounded color initialization.
- `renderer.py`: rasterization and alpha compositing.
- `optimizer.py`: perceptual hill-climbing loop, sigmoid multi-scale scheduling, adaptive alpha, splitting/refinement/death passes.
- `population.py`: 6-thread variant population + barrier-synchronized recombination.
- `display.py`: interactive four-panel runtime UI with keyboard controls.

## 4. Methodology
### 4.1 Candidate generation
Three shape types are supported:
- Triangle
- Quadrilateral (vertex-angle sorting to enforce convexity)
- Ellipse

The shape center is sampled from the current normalized error distribution, concentrating proposals in unresolved regions.

### 4.2 Perceptual color initialization
Target colors are modeled in LAB space using MiniBatchKMeans segmentation. For each proposal center, the corresponding cluster centroid is sampled with local LAB perturbation, then blended with local LAB patch statistics before converting back to RGB. This improves perceptual consistency in region-level color reconstruction.

### 4.3 Rendering model
Rasterization produces binary masks; compositing uses alpha blending:

$$
C_{new}[M] = \alpha\,\mathbf{c} + (1-\alpha)\,C[M]
$$

where $M$ is the shape mask and $\mathbf{c}$ the RGB color.

### 4.4 Optimization loop
The hill-climbing loop follows:

![Optimization loop](figures/optimization_flow.png)

1. Compute/update error map.
2. Sample proposal center from $p(E)$.
3. Generate and render candidate shape.
4. Accept candidate iff MSE strictly decreases.
5. Track acceptance and snapshots.

Adaptive alpha selection evaluates three candidate opacities per proposal (0.15, 0.40, 0.70) and picks the best perceptual-loss outcome.

## 5. Scheduling and Search Dynamics
### 5.1 Multi-scale weighting schedule
The coarse/fine blend uses a sigmoid transition rather than linear interpolation:

$$
w_{fine}(i) = \sigma\left(8\left(\frac{i}{N} - 0.4\right)\right), \quad
w_{coarse}(i) = 1 - w_{fine}(i)
$$

This keeps coarse structure dominant early and transitions rapidly to detail optimization after roughly 40% progress.

### 5.2 Geometry and maintenance strategies
- Shape selection is content-aware (edge/flat/texture) using structure magnitude and orientation.
- Accepted polygons may be split into child polygons in non-coarse phases when loss improves.
- Palette refinement runs every 500 accepted polygons.
- Polygon death/replacement removes low-contribution shapes on a configurable cadence.

### 5.3 Population-assisted search
A 6-variant threaded population runs in parallel with distinct personalities (edge emphasis, flat bias, size scaling, aggressive maintenance). Every 500 iterations, a barrier-synchronized recombination step greedily mixes polygon candidates from top variants and promotes improved combined states to the primary variant.

## 6. Verification and Testing
Behavioral and unit tests verify correctness:
- `test_mse.py`:
  - white vs black MSE = 1.0
  - white vs white MSE = 0.0
  - single red pixel has maximum local error at expected location
- `test_renderer.py`:
  - center pixel changes for triangle/ellipse
  - out-of-mask corner remains white
- `test_optimizer.py`:
  - 500-step heart run reduces MSE
  - acceptance history length is correct
  - minimum accepted proposals and non-empty snapshots

## 7. Experimental Results
Full demo configuration: up to 5000 iterations per target with interactive population-assisted visualization.

Observed best-run statistics:
- Best target: heart
- Iterations: 5000
- Accepted polygons: 925
- Final MSE: 0.003435
- Runtime: 8.86 s

All runs produce final canvases, replay GIFs, and a comparison grid (`comparison_grid.jpg`) showing targets, reconstructions, and MSE trajectories.

## 8. Discussion
### 8.1 Strengths
- Transparent optimization process with interpretable updates.
- Efficient attention-guided proposal distribution.
- Strong visual/quantitative convergence for low-resolution targets.

### 8.2 Limitations
- Greedy acceptance can stall near local minima.
- Bounding-box color initialization is heuristic.
- Fixed alpha range and fixed schedule may not be universally optimal.

### 8.3 Potential improvements
- Dynamic population resizing based on observed diversity.
- Stronger recombination operators with geometry-aware crossover.
- Optional CIEDE2000 metric for stricter perceptual fidelity.

## 9. Conclusion
The project demonstrates that a compact evolutionary search with error-guided attention can reconstruct images effectively while remaining interpretable and testable. The method provides a pedagogically useful bridge between classical optimization concepts and modern attention-based reasoning.

## References
1. Mitchell, M. (1998). *An Introduction to Genetic Algorithms*. MIT Press.
2. Kirkpatrick, S., Gelatt, C. D., & Vecchi, M. P. (1983). Optimization by Simulated Annealing. *Science*, 220(4598), 671-680.
3. Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.). Springer.
4. Gonzalez, R. C., & Woods, R. E. (2018). *Digital Image Processing* (4th ed.). Pearson.
5. Van Rossum, G., & Drake, F. L. (2009). *Python 3 Reference Manual*. CreateSpace.
6. Hunter, J. D. (2007). Matplotlib: A 2D Graphics Environment. *Computing in Science & Engineering*, 9(3), 90-95.
7. Virtanen, P., et al. (2020). SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python. *Nature Methods*, 17, 261-272.
8. Van der Walt, S., et al. (2014). scikit-image: Image processing in Python. *PeerJ*, 2:e453.
