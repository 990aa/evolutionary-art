from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

from src.optimizer import HillClimbingOptimizer
from src.output_tools import quality_vs_budget_analysis, save_log_evolution_frames


def test_log_evolution_recorder_saves_requested_frames(tmp_path: Path) -> None:
    target = np.zeros((80, 80, 3), dtype=np.float32)
    target[..., 0] = 0.8
    target[..., 1] = 0.2

    checkpoints = {1, 10, 20}
    optimizer = HillClimbingOptimizer(
        target_image=target,
        max_iterations=20,
        snapshot_iterations=checkpoints,
        random_seed=4,
    )
    optimizer.run(iterations=20)

    saved = save_log_evolution_frames(
        optimizer,
        output_dir=tmp_path,
        prefix="demo",
        iterations=(1, 10, 20),
    )

    assert set(saved.keys()) == {1, 10, 20}
    for path in saved.values():
        assert path.exists()

    assert (tmp_path / "demo_log_evolution_grid.png").exists()


def test_quality_vs_budget_analysis_outputs_curve_and_csv(tmp_path: Path) -> None:
    target = np.zeros((80, 80, 3), dtype=np.float32)
    target[..., 2] = 1.0

    optimizer = HillClimbingOptimizer(
        target_image=target,
        max_iterations=180,
        random_seed=9,
    )
    optimizer.run(iterations=180)

    curve, csv_path = quality_vs_budget_analysis(
        optimizer,
        output_dir=tmp_path,
        prefix="budget",
    )

    assert curve.exists()
    assert csv_path.exists()

    lines = csv_path.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) >= 2
    assert lines[0] == "polygon_count,perceptual_mse"


def test_compare_runner_generates_split_output(tmp_path: Path) -> None:
    project_root = Path(__file__).resolve().parents[1]
    compare_script = project_root / "compare.py"

    h, w = 180, 240
    y = np.linspace(0.0, 1.0, h, dtype=np.float32)
    x = np.linspace(0.0, 1.0, w, dtype=np.float32)
    xx, yy = np.meshgrid(x, y)
    img = np.zeros((h, w, 3), dtype=np.float32)
    img[..., 0] = xx
    img[..., 1] = yy
    img[..., 2] = 0.5

    image_path = tmp_path / "compare_input.png"
    Image.fromarray((img * 255).astype(np.uint8), mode="RGB").save(image_path)

    output_path = tmp_path / "compare_output.png"
    completed = subprocess.run(
        [
            sys.executable,
            str(compare_script),
            str(image_path),
            "--iterations",
            "120",
            "--no-display",
            "--output",
            str(output_path),
        ],
        cwd=project_root,
        capture_output=True,
        text=True,
        check=False,
    )

    assert completed.returncode == 0, completed.stderr
    assert output_path.exists()
    assert "Comparison Summary" in completed.stdout
