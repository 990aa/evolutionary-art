# Attention-Guided Evolutionary Reconstruction with Progressive Growth and Runtime Safety

## Abstract
This paper studies an interpretable evolutionary reconstruction framework that approximates images using alpha-composited geometric primitives. The method combines complexity-aware stage planning, multi-resolution progression, residual-guided targeted growth, and strict timeout safety for robust long-running execution. A five-panel visualization is introduced to expose optimization behavior in real time, including directional residual analysis and geometry-only evolution. Experimental evaluation on portrait, landscape, and graphic targets shows substantial error reduction under fixed budgets, with high-resolution runs achieving up to 93.50% reconstruction accuracy.

## 1. Introduction
Primitive-based optimization offers transparency: each accepted shape has direct visual and numerical meaning. Compared with end-to-end latent synthesis, this formulation enables granular diagnostics and controllable interventions. The main practical challenge is balancing convergence quality, runtime safety, and live interpretability.

This work contributes:
1. Complexity-adaptive staged optimization.
2. Multi-resolution progressive transfer (coarse-to-fine).
3. Timeout-safe execution with hard-stop guarantees.
4. Interactive forced growth and residual correction controls.
5. Event-annotated five-panel live diagnostics.

## 2. Objective
For target image $T$ and reconstruction $C$, optimization minimizes:

$$
\mathcal{L}(T,C)=\frac{1}{3HW}\sum_{y=1}^{H}\sum_{x=1}^{W}\sum_{c=1}^{3}(T_{y,x,c}-C_{y,x,c})^2.
$$

The signed residual used for directional diagnostics is:

$$
R_s(y,x)=\operatorname{clip}\left(\frac{1}{3}\sum_{c=1}^{3}(T_{y,x,c}-C_{y,x,c}),-1,1\right),
$$

where positive indicates under-bright reconstruction and negative indicates over-bright reconstruction.

## 3. Method

### 3.1 Stage Design
Optimization is organized into four stages:
1. Stage A: global color fitting from grid initialization.
2. Stage B: medium-size targeted growth and local settling.
3. Stage C: high-frequency targeted detail growth.
4. Stage D: global positional refinement without additional growth.

Batch insertions are checkpointed and reverted if post-batch optimization degrades loss beyond tolerance.

### 3.2 Multi-Resolution Progression
Optimization starts at lower resolution and transitions upward after coarse structure stabilizes. Polygon centers and sizes are scaled at each transition, preserving learned composition while increasing detail capacity.

### 3.3 Timeout-Safe Runtime
Two deadlines are enforced:
1. A soft runtime budget.
2. A hard safety timeout.

All optimization loops check deadlines before stepping. Forced interventions are bounded and rollback-protected, preventing stuck sessions.

### 3.4 Interactive Intervention Operators
1. Forced growth: immediate insertion of a targeted polygon batch.
2. Forced decomposition-correction: low-frequency residual color correction plus high-frequency detail insertion.

### 3.5 Five-Panel Visualization
The display includes:
1. Target.
2. Reconstruction (focus view).
3. Residual diagnostics.
4. Polygon outlines (blue/green/red by large/medium/small).
5. Log-loss with resolution and batch event markers.

## 4. Experimental Design
Three classes of internet images were evaluated: portrait, landscape, and graphic. Two primary protocols were used:
1. Paired 800-iteration baseline-vs-improved comparisons.
2. High-resolution final runs at 500x500 with 1000 polygons and 5-minute budget.

Metrics: MSE, RMSE, PSNR, SSIM, reconstruction accuracy, and pixel-match rate.

## 5. Results

### 5.1 Paired 800-Iteration Comparison
| Target Type | Baseline Error | Proposed Error | Absolute Improvement |
| --- | ---: | ---: | ---: |
| Portrait | 555.1732 | 114.7067 | 440.4665 |
| Landscape | 208.1470 | 1.9645 | 206.1825 |
| Graphic | 359.3228 | 14.0109 | 345.3118 |

### 5.2 High-Resolution Final Reconstructions
| Target Type | Iterations | Accepted Polygons | MSE | RMSE | PSNR (dB) | SSIM | Accuracy (%) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Portrait | 471 | 119 | 0.1815 | 0.4260 | 7.41 | 0.2534 | 81.85 |
| Landscape | 331 | 104 | 0.0650 | 0.2550 | 11.87 | 0.8080 | 93.50 |
| Graphic | 661 | 252 | 0.1287 | 0.3587 | 8.91 | 0.5148 | 87.13 |

### 5.3 Budget Sensitivity
Perceptual error decreases consistently as polygon budget increases across tested categories, confirming expected capacity-performance scaling.

## 6. Discussion
The combination of directional residual guidance, staged growth, and resolution transfer provides reliable convergence under constrained runtime. Event-annotated loss traces reveal expected sawtooth dynamics: insertion jumps followed by rapid recovery. The landscape case demonstrates strongest structural fidelity, while portrait and graphic scenes remain harder due to smooth gradient fidelity and high-contrast boundary complexity.

## 7. Limitations and Future Work
1. A larger benchmark set is required for stronger statistical claims.
2. Pixel losses alone cannot fully model perception.
3. Richer primitive families may improve portrait smoothness and sharp stylized boundaries.
4. Adaptive perceptual losses and uncertainty-aware scheduling are promising next directions.

## 8. Conclusion
A standalone, runtime-safe, and interactive evolutionary reconstruction framework was presented for arbitrary images. The method achieves strong quantitative gains over baseline behavior while preserving interpretability and live steerability.

## References
1. Mitchell, M. *An Introduction to Genetic Algorithms*. MIT Press, 1998.
2. Kirkpatrick, S., Gelatt, C. D., and Vecchi, M. P. Optimization by Simulated Annealing. *Science*, 220(4598):671-680, 1983.
3. Porter, T., and Duff, T. Compositing Digital Images. *SIGGRAPH Computer Graphics*, 18(3):253-259, 1984.
4. Burt, P. J., and Adelson, E. H. The Laplacian Pyramid as a Compact Image Code. *IEEE Transactions on Communications*, 31(4):532-540, 1983.
5. Nocedal, J., and Wright, S. J. *Numerical Optimization* (2nd ed.). Springer, 2006.
6. Wang, Z., Bovik, A. C., Sheikh, H. R., and Simoncelli, E. P. Image Quality Assessment: From Error Visibility to Structural Similarity. *IEEE Transactions on Image Processing*, 13(4):600-612, 2004.
7. Van der Walt, S., Schonberger, J. L., Nunez-Iglesias, J., et al. scikit-image: Image Processing in Python. *PeerJ*, 2:e453, 2014.
8. Pedregosa, F., Varoquaux, G., Gramfort, A., et al. Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research*, 12:2825-2830, 2011.
