from pathlib import Path
import runpy

namespace = runpy.run_path(str(Path(__file__).with_name("main.py.py")))
app = namespace["app"]
