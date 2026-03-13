from __future__ import annotations

import re
import sqlite3
from pathlib import Path
from typing import Any

from flask import Flask, flash, g, redirect, render_template, request, url_for

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "luxury_assets.db"

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-this-secret-key"


def get_db() -> sqlite3.Connection:
    """Return a SQLite connection for the current request context."""
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


def init_db() -> None:
    """Create the leads table on first run."""
    db = sqlite3.connect(DATABASE_PATH)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            asset_interest TEXT NOT NULL,
            budget_range TEXT NOT NULL,
            primary_goal TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    db.commit()
    db.close()


init_db()


@app.teardown_appcontext
def close_db(_: BaseException | None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def validate_lead(form_data: dict[str, str]) -> tuple[bool, dict[str, str]]:
    """Perform simple server-side validation for lead submissions."""
    errors: dict[str, str] = {}
    email_pattern = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone_pattern = re.compile(r"^[0-9+\-\s()]{7,20}$")

    required_fields = [
        "full_name",
        "email",
        "phone",
        "asset_interest",
        "budget_range",
        "primary_goal",
        "message",
    ]

    for field in required_fields:
        if not form_data.get(field, "").strip():
            errors[field] = "This field is required."

    email = form_data.get("email", "").strip()
    if email and not email_pattern.match(email):
        errors["email"] = "Please enter a valid email address."

    phone = form_data.get("phone", "").strip()
    if phone and not phone_pattern.match(phone):
        errors["phone"] = "Please enter a valid phone number."

    if len(form_data.get("message", "").strip()) < 20:
        errors["message"] = "Please provide a little more detail about your goal."

    return len(errors) == 0, errors


def default_form_data() -> dict[str, str]:
    return {
        "full_name": "",
        "email": "",
        "phone": "",
        "asset_interest": "",
        "budget_range": "",
        "primary_goal": "",
        "message": "",
    }


def page_context(page_name: str, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    context: dict[str, Any] = {
        "page_name": page_name,
        "form_data": default_form_data(),
        "form_errors": {},
    }
    if extra:
        context.update(extra)
    return context


@app.route("/")
def home() -> str:
    return render_template("index.html", **page_context("home"))


@app.route("/course")
def course() -> str:
    return render_template("course.html", **page_context("course"))


@app.route("/consultation")
def consultation() -> str:
    return render_template("consult.html", **page_context("consultation"))


@app.route("/thank-you")
def thank_you() -> str:
    return render_template("thank-you.html", page_name="thank-you")


@app.route("/submit-lead", methods=["POST"])
def submit_lead() -> str:
    form_data = {
        "full_name": request.form.get("full_name", "").strip(),
        "email": request.form.get("email", "").strip(),
        "phone": request.form.get("phone", "").strip(),
        "asset_interest": request.form.get("asset_interest", "").strip(),
        "budget_range": request.form.get("budget_range", "").strip(),
        "primary_goal": request.form.get("primary_goal", "").strip(),
        "message": request.form.get("message", "").strip(),
    }
    source_page = request.form.get("source_page", "home")

    is_valid, errors = validate_lead(form_data)
    if not is_valid:
        flash("Please correct the highlighted fields and resubmit.", "error")
        template_map = {
            "course": "course.html",
            "consultation": "consult.html",
            "home": "index.html",
        }
        template_name = template_map.get(source_page, "index.html")
        return render_template(
            template_name,
            **page_context(source_page, {"form_data": form_data, "form_errors": errors}),
        )

    db = get_db()
    db.execute(
        """
        INSERT INTO leads (
            full_name,
            email,
            phone,
            asset_interest,
            budget_range,
            primary_goal,
            message
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            form_data["full_name"],
            form_data["email"],
            form_data["phone"],
            form_data["asset_interest"],
            form_data["budget_range"],
            form_data["primary_goal"],
            form_data["message"],
        ),
    )
    db.commit()

    flash("Your private inquiry has been received.", "success")
    return redirect(url_for("thank_you"))


if __name__ == "__main__":
    # Local setup:
    # 1. python -m venv .venv
    # 2. .venv\Scripts\activate
    # 3. pip install -r requirements.txt
    # 4. python app.py
    init_db()
    app.run(debug=True)
