"""
ml_api.py  —  Backwards-compatible bootstrap.
This file exists so existing scripts using `python ml_api.py` continue to work.
All logic lives in the modular app/ package.  Run `python run.py` instead.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

app = create_app()

if __name__ == "__main__":
    df = app.df
    print("\n" + "="*70)
    print("SMART COLLEGE FINDER  —  v3.0 (Blueprint Architecture)")
    print("="*70)
    print(f"📊 Records  : {len(df):,}")
    print(f"🏫 Colleges  : {df['college_code'].nunique():,}")
    print(f"🎓 Branches  : {df['branch_name'].nunique()}")
    print(f"📋 Categories: {df['category'].nunique()}")
    print(f"🏙️  Cities    : {df['city'].nunique()}")
    print("="*70 + "\n")
    app.run(host="0.0.0.0", port=5001, debug=True)