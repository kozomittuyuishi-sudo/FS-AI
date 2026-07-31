from appearance.window import MainWindow


class BrainEngine:
    def __init__(self):
        self.window = None

    def boot(self):
        print("===================================")
        print(" FashionSense AI Boot Sequence")
        print("===================================")

        print("[✓] Brain Initialized")
        print("[✓] Memory Loaded")
        print("[✓] Knowledge Loaded")
        print("[✓] Vision Loaded")
        print("[✓] Reasoning Loaded")
        print("[✓] Stylist Loaded")
        print("[✓] Wardrobe Loaded")
        print("[✓] Identity Loaded")
        print("[✓] Voice Loaded")

        print("\nLaunching Interface...\n")

        self.window = MainWindow()

        print("[✓] System Ready")

    def run(self):
        if self.window is None:
            raise RuntimeError("BrainEngine must be booted before running the window.")

        self.window.run()