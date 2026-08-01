from appearance.window import MainWindow

from vision.vision import Vision
from memory.memory import Memory
from knowledge.knowledge import Knowledge
from reasoning.reasoning import Reasoning
from stylist.stylist import Stylist
from wardrobe.wardrobe import Wardrobe
from identity.identity import Identity
from voice.voice import Voice


class BrainEngine:
    def __init__(self):
        self.window = None
        self.modules = {}

    def boot(self):
        print("===================================")
        print(" FashionSense AI Boot Sequence")
        print("===================================\n")

        self.modules = {
            "vision": Vision(),
            "memory": Memory(),
            "knowledge": Knowledge(),
            "reasoning": Reasoning(),
            "stylist": Stylist(),
            "wardrobe": Wardrobe(),
            "identity": Identity(),
            "voice": Voice(),
        }

        print("\n[✓] All modules loaded.")
        print("[✓] Launching Interface...\n")

        self.window = MainWindow()

    def run(self):
        if self.window is None:
            raise RuntimeError("BrainEngine is not booted. Call boot() before run().")
        self.window.run()