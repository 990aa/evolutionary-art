from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class VariantPersonality:
    """Deprecated placeholder for backward compatibility.

    The Phase 4 pipeline no longer uses multi-variant population optimization.
    """

    name: str = "single-optimizer"


class PopulationHillClimber:
    """Deprecated compatibility shim.

    Phase 4 removed the threaded multi-variant population path in favor of a
    single staged optimizer. This shim keeps import compatibility for older code.
    """

    def __init__(self, *args, **kwargs) -> None:
        del args
        del kwargs
        self._running = False

    def start(self) -> None:
        self._running = True

    def stop(self) -> None:
        self._running = False

    def wait_until_complete(self, timeout: float | None = None) -> bool:
        del timeout
        return True

    @property
    def running(self) -> bool:
        return self._running
