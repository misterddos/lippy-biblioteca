from flask import Flask, render_template, jsonify, send_file, abort, request
from pathlib import Path
from urllib.parse import unquote
import os

BASE_DIR = Path(__file__).resolve().parent
# Por padrão, usa a biblioteca que você já possui no Termux.
LIBRARY_DIR = Path(os.environ.get("LIPPY_LIBRARY_DIR", str(Path.home() / "biblioteca"))).expanduser().resolve()
app = Flask(__name__)

CATEGORIES = [
    "Literatura", "Ciência", "Tecnologia", "História", "Filosofia",
    "Educação", "Religião", "Programação", "Outros"
]

def category_for(path: Path) -> str:
    parts = [p.casefold() for p in path.relative_to(LIBRARY_DIR).parts[:-1]]
    for category in CATEGORIES:
        if category.casefold() in parts:
            return category
    return "Outros"

def scan_books():
    books = []
    if not LIBRARY_DIR.exists():
        return books
    for path in LIBRARY_DIR.rglob("*"):
        if path.is_file() and path.suffix.casefold() == ".pdf":
            try:
                rel = path.relative_to(LIBRARY_DIR).as_posix()
                books.append({
                    "id": rel,
                    "title": path.stem.replace("_", " ").replace("-", " "),
                    "filename": path.name,
                    "category": category_for(path),
                    "size": round(path.stat().st_size / (1024 * 1024), 2)
                })
            except (OSError, ValueError):
                continue
    return sorted(books, key=lambda b: b["title"].casefold())

@app.get("/")
def home():
    return render_template("index.html", categories=CATEGORIES, library_path=str(LIBRARY_DIR))

@app.get("/api/books")
def api_books():
    books = scan_books()
    query = request.args.get("q", "").strip().casefold()
    category = request.args.get("category", "").strip()
    if query:
        books = [b for b in books if query in b["title"].casefold() or query in b["filename"].casefold()]
    if category and category != "Todas":
        books = [b for b in books if b["category"] == category]
    return jsonify({"books": books, "total": len(books)})

@app.get("/book/<path:book_id>")
def read_book(book_id):
    # Impede caminhos que tentem sair da pasta da biblioteca.
    target = (LIBRARY_DIR / unquote(book_id)).resolve()
    try:
        target.relative_to(LIBRARY_DIR)
    except ValueError:
        abort(404)
    if not target.is_file() or target.suffix.casefold() != ".pdf":
        abort(404)
    return send_file(target, mimetype="application/pdf", as_attachment=False, download_name=target.name)

@app.get("/health")
def health():
    return jsonify({"status": "ok", "library_exists": LIBRARY_DIR.exists(), "library": str(LIBRARY_DIR)})

if __name__ == "__main__":
    print("\\nLIPPY BIBLIOTECA LOCAL")
    print(f"Biblioteca: {LIBRARY_DIR}")
    print("Abra no navegador: http://127.0.0.1:5000\\n")
    app.run(host="127.0.0.1", port=5000, debug=False)
