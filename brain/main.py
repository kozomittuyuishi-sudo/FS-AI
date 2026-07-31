from .orchestrator.engine import BrainEngine


class Brain:
    def __init__(self):
        self.engine = BrainEngine()

    def start(self):
        self.engine.boot()
        self.engine.run()