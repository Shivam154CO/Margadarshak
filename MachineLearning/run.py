"""
run.py  —  Entry point for the Smart College Finder API (v3.0)
Run this file to start the server:  python run.py
"""
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
