"""Preview the static website with the same page rewrites as Vercel.

Email submission is intentionally unavailable on this local server.
Run: python3 scripts/serve.py
"""
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
ROUTES = {
    route["source"]: route["destination"]
    for route in json.loads((ROOT / "vercel.json").read_text())["rewrites"]
}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ROUTES:
            self.path = ROUTES[path]
        super().do_GET()

    def do_POST(self):
        body = b'{"error":"Email submission is unavailable in this local preview."}'
        self.send_response(503)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    print("DOTS local preview: http://localhost:8000 (Ctrl+C to stop)", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
