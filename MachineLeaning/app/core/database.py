"""
app/core/database.py
Handles all Supabase connection and data loading.
Single source of truth for the DataFrame `df`.
"""
import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise EnvironmentError(
        "Missing SUPABASE_URL or SUPABASE_KEY environment variables. "
        "Create a .env file or set them in your deployment dashboard."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def load_dataframe() -> pd.DataFrame:
    """Load college data from Supabase with CSV fallback. Returns processed DataFrame."""
    print("📂 Loading dataset from Supabase...")
    try:
        all_data = []
        page = 0
        page_size = 1000

        while True:
            response = supabase.table("colleges_2025") \
                .select("*") \
                .range(page * page_size, (page + 1) * page_size - 1) \
                .execute()

            if not response.data:
                break

            all_data.extend(response.data)
            print(f"   Loaded page {page + 1}: {len(response.data)} records")

            if len(response.data) < page_size:
                break

            page += 1

        df = pd.DataFrame(all_data)
        print(f"✅ Successfully loaded {len(df):,} records from Supabase")

    except Exception as e:
        print(f"❌ Error loading from Supabase: {e}")
        # Use path relative to this file so it works on any machine
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        csv_path = os.path.join(base_path, "Maharashtra_Diploma_Datasets.csv")
        df = pd.read_csv(csv_path)

    df = _preprocess(df)
    return df


def _preprocess(df: pd.DataFrame) -> pd.DataFrame:
    """Clean, rename, and fill nulls in the raw DataFrame."""
    print(f"\n📋 Dataset Columns Found: {list(df.columns[:20])}...")

    numeric_cols = [
        'cutoff_rank', 'cutoff_percentile', 'total_intake', 'Seats',
        'Fees', 'hostel_fees', 'bus_fees', 'placement_rate',
        'average_package_lpa', 'highest_package_lpa', 'internship_rate',
        'foreign_offers', 'labs_count', 'hostel_capacity', 'established_year'
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    df.rename(columns={
        'College_name': 'college_name', 'Seats': 'seats', 'Fees': 'fees',
        'Branch_name': 'branch_name', 'City': 'city', 'District': 'district',
        'University': 'university', 'Autonomy_status': 'autonomy_status',
        'Accreditation': 'accreditation', 'Degree_type': 'degree_type',
        'Duration_years': 'duration_years', 'Shift': 'shift', 'Category': 'category',
        'Image_url': 'image_url', 'Logo_url': 'logo_url',
        'Contact_email': 'contact_email', 'Contact_phone': 'contact_phone',
        'Website_url': 'website_url', 'Top_recruiters': 'top_recruiters',
        'Placement_cell_contact': 'placement_cell_contact',
        'Hostel_available': 'hostel_available', 'Wifi_campus': 'wifi_campus',
        'Transport_facility': 'transport_facility', 'Medical_facility': 'medical_facility'
    }, inplace=True)

    df.fillna({
        'college_name': 'Unknown', 'short_name': '', 'city': 'Unknown',
        'branch_name': 'Unknown', 'category': 'OPEN',
        'degree_type': 'Not Available', 'accreditation': 'Not Available',
        'top_recruiters': '', 'image_url': '', 'logo_url': '',
        'contact_email': '', 'contact_phone': '', 'website_url': ''
    }, inplace=True)

    print(f"\n✅ Dataset loaded successfully")
    print(f"📊 Total records: {len(df):,}")
    print(f"🏫 Unique colleges: {df['college_code'].nunique():,}")
    print(f"🎯 Unique branches: {df['branch_name'].nunique()}")
    print(f"📜 Degree types found: {df['degree_type'].unique()[:10]}")
    return df
