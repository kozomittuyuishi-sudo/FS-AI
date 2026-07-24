from .orchestrator.engine import BrainEngine


class Brain:
    def __init__(self):
        self.engine = BrainEngine()

    def start(self):
        print("FSAI is online.")
        self.engine.run()