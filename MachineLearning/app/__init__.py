"""
app/__init__.py
Flask Application Factory — wires everything together.
"""
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache

from app.core.database import load_dataframe


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    # ── Rate Limiter ─────────────────────────────────────────────────────────
    Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"]
    )

    # ── Cache ─────────────────────────────────────────────────────────────────
    Cache(app, config={'CACHE_TYPE': 'SimpleCache'})

    # ── Load Dataset once at startup ──────────────────────────────────────────
    app.df = load_dataframe()

    # ── Pre-calculate expensive mappings ──────────────────────────────────────
    # This prevents high CPU usage by avoiding a full groupby on every API request
    app.college_branches = app.df.groupby('college_code')['branch_name'].unique().apply(list).to_dict()

    # ── Register Blueprints ───────────────────────────────────────────────────
    from app.routes.college_routes     import college_bp
    from app.routes.prediction_routes  import prediction_bp
    from app.routes.intelligence_routes import intelligence_bp

    app.register_blueprint(college_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(intelligence_bp)

    return app
