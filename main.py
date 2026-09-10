from pathlib import Path
import subprocess

from brain.IQ import Brain


ROOT = Path(__file__).resolve().parent
APPEARANCE = ROOT / "appearance"


def start_frontend():
    subprocess.Popen(
        ["npm.cmd", "run", "dev"],
        cwd=APPEARANCE
    )


def main():
    brain = Brain()
    brain.start()

    start_frontend()

    print("FSAI is running.")


if __name__ == "__main__":
    main()