# Luxury Assets Site

Premium Flask starter site for a luxury asset education and advisory brand focused on strategic ownership, operational discipline, and high-ticket lead capture.

## Project Structure

```text
luxury-assets-site/
├── app.py
├── requirements.txt
├── README.md
├── luxury_assets.db
├── templates/
│   ├── index.html
│   ├── course.html
│   ├── consult.html
│   └── thank-you.html
└── static/
    ├── style.css
    └── main.js
```

## Run Locally

1. Create a virtual environment:

```powershell
python -m venv .venv
```

2. Activate it:

```powershell
.venv\Scripts\activate
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Start the Flask app:

```powershell
python app.py
```

5. Open the local server:

```text
http://127.0.0.1:5000
```

## Notes

- `luxury_assets.db` is created automatically on first run.
- Lead submissions are stored in SQLite with basic server-side validation.
- Frontend interactions are handled in `static/main.js`.
