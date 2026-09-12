import os
import subprocess
from pathlib import Path

from brain.IQ import Brain


ROOT = Path(__file__).resolve().parent
APPEARANCE = ROOT / "appearance"


def start_frontend(brain):
    env = os.environ.copy()
    env["FSAI_BRAIN_STATUS"] = "ONLINE" if brain.is_running() else "OFFLINE"

    return subprocess.Popen(
        ["npm.cmd", "run", "dev"],
        cwd=APPEARANCE,
        env=env,
    )


def main():
    brain = Brain()
    brain.start()

    frontend = start_frontend(brain)

    print("FSAI is running.")

    try:
        frontend.wait()
    except KeyboardInterrupt:
        print("\nStopping FSAI...")
    finally:
        brain.stop()

        if frontend.poll() is None:
            frontend.terminate()

        print("FSAI stopped.")


if __name__ == "__main__":
    main()