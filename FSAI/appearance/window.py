import customtkinter as ctk


class MainWindow:
    def __init__(self):
        # Appearance
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        # Window
        self.app = ctk.CTk()
        self.app.title("FashionSense AI")
        self.app.geometry("1200x700")
        self.app.minsize(1000, 600)

        # Title
        title = ctk.CTkLabel(
            self.app,
            text="FashionSense AI",
            font=("Segoe UI", 28, "bold")
        )
        title.pack(pady=40)

        # Subtitle
        subtitle = ctk.CTkLabel(
            self.app,
            text="Building something beautiful...",
            font=("Segoe UI", 16)
        )
        subtitle.pack()

    def run(self):
        self.app.mainloop()