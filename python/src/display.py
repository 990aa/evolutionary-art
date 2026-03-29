from __future__ import annotations

from dataclasses import dataclass

from src.live_phase7 import Phase7ControlState, run_phase7_live_display


@dataclass
class UIState:
    paused: bool = False
    quit_requested: bool = False


def handle_control_key(
    key: str,
    *,
    ui: UIState,
    controls: Phase7ControlState,
    screenshot_callback,
    quit_callback,
) -> str:
    normalized = (key or "").lower()
    if normalized == "p":
        controls.paused = not controls.paused
        ui.paused = controls.paused
        return "pause"
    if normalized == "r":
        screenshot_callback()
        return "screenshot"
    if normalized == "q":
        controls.quit_requested = True
        ui.quit_requested = True
        quit_callback()
        return "quit"
    return "noop"


def run_live_display(*args, **kwargs):
    """Compatibility wrapper for the Phase 5 single-optimizer display path."""

    return run_phase7_live_display(*args, **kwargs)
