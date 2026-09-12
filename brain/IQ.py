class Brain:
    def __init__(self):
        self.modules = {}
        self.running = False

    def start(self):
        if self.running:
            return

        self.running = True
        print("FSAI IQ is online.")

    def stop(self):
        if not self.running:
            return

        self.running = False
        print("FSAI IQ is offline.")

    def is_running(self):
        return self.running

    def register(self, name, module):
        self.modules[name] = module

    def get_module(self, name):
        return self.modules.get(name)

    def has_module(self, name):
        return name in self.modules

    def handle(self, request):
        if not request:
            return {
                "status": "error",
                "message": "No request provided."
            }

        module_name = request.get("module")

        if not module_name:
            return {
                "status": "error",
                "message": "No target module specified."
            }

        module = self.get_module(module_name)

        if module is None:
            return {
                "status": "error",
                "message": f"Module '{module_name}' is not registered."
            }

        return module.handle(request)