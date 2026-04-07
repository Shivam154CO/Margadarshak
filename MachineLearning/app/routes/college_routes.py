"""
app/routes/college_routes.py
Handles: /college_details, /colleges
"""
import pandas as pd
from flask import Blueprint, current_app, request, jsonify
from app.core.predictor import get_category_variations

college_bp = Blueprint("college", __name__)


@college_bp.route("/college_details", methods=["POST", "OPTIONS"])
def get_college_details():
    """Get complete details for a specific college-branch-category combination."""
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data        = request.get_json()
        college_code = data.get("college_code")
        branch_name  = data.get("branch_name")
        category     = data.get("category", "ALL")
        df           = current_app.df

        print(f"\n📋 Getting details for: {college_code} | {branch_name} | {category}")

        if not college_code or not branch_name:
            return jsonify({"error": "College code and branch name required"}), 400

        filtered_df = df.copy()

        expected_columns = [
            'college_code', 'college_name', 'short_name', 'city', 'district', 'region',
            'university', 'autonomy_status', 'established_year', 'accreditation',
            'branch_name', 'branch_code', 'degree_type', 'duration_years', 'shift',
            'cutoff_rank', 'cutoff_percentile', 'category', 'total_intake', 'seats',
            'fees', 'hostel_fees', 'bus_fees', 'placement_rate',
            'average_package_lpa', 'highest_package_lpa', 'internship_rate',
            'foreign_offers', 'top_recruiters', 'placement_cell_contact',
            'hostel_available', 'hostel_type', 'hostel_capacity', 'labs_count',
            'wifi_campus', 'transport_facility', 'medical_facility',
            'image_url', 'logo_url', 'contact_email', 'contact_phone', 'website_url',
            'student_faculty_ratio', 'campus_area', 'library_books', 'sports_facilities',
            'clubs_count', 'scholarship_opportunities', 'international_collaborations',
            'industry_tie_ups', 'research_papers', 'patents', 'alumni_strength', 'rating'
        ]

        for col in expected_columns:
            if col not in filtered_df.columns:
                if col in ['college_name', 'branch_name', 'city', 'category', 'degree_type', 'accreditation']:
                    filtered_df[col] = ''
                else:
                    filtered_df[col] = 0

        for col in ['college_code', 'branch_name', 'category', 'degree_type', 'accreditation']:
            filtered_df[col] = filtered_df[col].astype(str).str.strip()

        mask = (
            (filtered_df['college_code'].str.lower() == str(college_code).strip().lower()) &
            (filtered_df['branch_name'].str.lower()  == str(branch_name).strip().lower())
        )

        if category and str(category).strip().upper() != 'ALL':
            category_variations = get_category_variations(category)
            filtered_df['cat_norm'] = filtered_df['category'].astype(str).str.strip().str.upper()
            category_mask = filtered_df['cat_norm'].isin([c.upper() for c in category_variations])
            mask = mask & category_mask

        result_df = filtered_df[mask]

        if len(result_df) == 0:
            result_df = df.copy()
            result_df = result_df[
                (result_df['college_code'].astype(str).str.contains(str(college_code).strip(), case=False, na=False)) &
                (result_df['branch_name'].astype(str).str.contains(str(branch_name).strip(), case=False, na=False))
            ]
            if len(result_df) == 0:
                return jsonify({
                    "error": "No matching college found",
                    "debug": {"requested": {"college_code": college_code, "branch_name": branch_name, "category": category}}
                }), 404

        row = result_df.iloc[0]
        college_details = {}

        for col in expected_columns:
            value = row.get(col)
            if pd.isna(value) or value is None:
                int_cols = ['established_year', 'total_intake', 'seats', 'hostel_capacity',
                            'labs_count', 'foreign_offers', 'duration_years', 'clubs_count',
                            'industry_tie_ups', 'research_papers', 'patents', 'alumni_strength']
                float_cols = ['fees', 'hostel_fees', 'bus_fees', 'placement_rate',
                              'average_package_lpa', 'highest_package_lpa', 'internship_rate',
                              'cutoff_rank', 'cutoff_percentile', 'student_faculty_ratio',
                              'campus_area', 'library_books', 'rating']
                college_details[col] = 0 if col in int_cols else (0.0 if col in float_cols else '')
            else:
                college_details[col] = value

        int_fields   = ['established_year', 'total_intake', 'seats', 'hostel_capacity',
                        'labs_count', 'foreign_offers', 'duration_years', 'clubs_count',
                        'industry_tie_ups', 'research_papers', 'patents', 'alumni_strength']
        float_fields = ['fees', 'hostel_fees', 'bus_fees', 'placement_rate',
                        'average_package_lpa', 'highest_package_lpa', 'internship_rate',
                        'cutoff_rank', 'cutoff_percentile', 'student_faculty_ratio',
                        'campus_area', 'library_books', 'rating']

        for field in int_fields:
            if field in college_details:
                try: college_details[field] = int(float(college_details[field]))
                except: college_details[field] = 0

        for field in float_fields:
            if field in college_details:
                try: college_details[field] = float(college_details[field])
                except: college_details[field] = 0.0

        string_fields = ['college_name', 'city', 'branch_name', 'category', 'university',
                         'autonomy_status', 'hostel_available', 'accreditation', 'degree_type',
                         'top_recruiters', 'placement_cell_contact', 'wifi_campus',
                         'transport_facility', 'medical_facility', 'sports_facilities',
                         'scholarship_opportunities', 'international_collaborations', 'shift']
        for field in string_fields:
            if field in college_details:
                college_details[field] = str(college_details[field]).strip()
                if college_details[field] in ['', 'nan', 'None', 'NaT', 'null']:
                    if field in ('degree_type', 'accreditation'): college_details[field] = 'Not Available'
                    elif field == 'top_recruiters':               college_details[field] = ''
                    else:                                          college_details[field] = 'N/A'

        college_details['admission_dates'] = {
            'application_start': 'June 15, 2026', 'application_end': 'July 10, 2026',
            'merit_list_date':   'July 25, 2026',  'admission_start':  'August 01, 2026',
            'admission_end':     'August 31, 2026'
        }
        college_details['admission_process'] = [
            {'step': 1, 'title': 'Online Registration',     'description': 'Register on the DTE Maharashtra website with your details.',                                           'deadline': 'June 15, 2026',   'required_docs': ['Aadhar Card', 'SSC/HSC Marksheet']},
            {'step': 2, 'title': 'Document Verification',   'description': 'Visit the Facilitation Center (FC) for original document verification and confirmation.',              'deadline': 'June 25, 2026',   'required_docs': ['Original Certificates', 'FC Form']},
            {'step': 3, 'title': 'Merit List Publication',  'description': 'Check provisional and final merit list positions on the official portal.',                              'deadline': 'July 10, 2026',   'required_docs': []},
            {'step': 4, 'title': 'Option Form Filling',     'description': 'Submit your preferences for colleges and branches (Choice Codes).',                                    'deadline': 'July 25, 2026',   'required_docs': ['Option Form List']},
            {'step': 5, 'title': 'CAP Round 1 Allotment',   'description': 'View seat allotment and accept/refuse the seat on the portal.',                                       'deadline': 'August 01, 2026', 'required_docs': ['Allotment Letter']},
            {'step': 6, 'title': 'Reporting to Institute',  'description': 'Report to the allotted college for final admission and fee payment.',                                  'deadline': 'August 15, 2026', 'required_docs': ['Fee Receipt', 'Leaving Certificate']}
        ]
        college_details['admission_contacts'] = [
            {'name': 'DTE Maharashtra Helpdesk', 'phone': '1800-102-3636',          'email': 'helpdesk@dte.org.in',                                          'role': 'DTE Admission Helpline'},
            {'name': 'College Admission Officer', 'phone': str(college_details.get('contact_phone', 'Contact College')), 'email': str(college_details.get('contact_email', 'contact@college.edu')), 'role': 'College Admission Cell'}
        ]

        print(f"✅ Found college: {college_details.get('college_name')}")
        return jsonify(college_details)

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e), "message": "Failed to fetch college details"}), 500


@college_bp.route("/colleges", methods=["GET"])
def get_colleges():
    try:
        df = current_app.df
        agg_dict = {
            'college_name': 'first', 'short_name': 'first', 'city': 'first',
            'district': 'first', 'region': 'first', 'university': 'first',
            'autonomy_status': 'first', 'established_year': 'first',
            'branch_name': lambda x: ', '.join(str(v) for v in x.unique() if pd.notna(v)),
            'degree_type': 'first', 'accreditation': 'first', 'hostel_available': 'first',
            'image_url': 'first', 'logo_url': 'first', 'contact_email': 'first',
            'contact_phone': 'first', 'website_url': 'first', 'fees': 'first',
            'placement_rate': 'mean', 'average_package_lpa': 'mean',
            'highest_package_lpa': 'max', 'total_intake': 'sum',
            'seats': 'sum', 'cutoff_rank': 'min'
        }
        unique_colleges = df.groupby('college_code').agg(agg_dict).reset_index()

        frontend_colleges = []
        for college in unique_colleges.to_dict(orient="records"):
            frontend_colleges.append({
                'college_code':       college.get('college_code'),
                'college_name':       college.get('college_name'),
                'city':               college.get('city'),
                'branch':             college.get('branch_name', 'N/A'),
                'fees':               float(college.get('fees', 0)),
                'placement_rate':     float(college.get('placement_rate', 0)),
                'cutoff_score':       int(college.get('cutoff_rank', 0)),
                'autonomy_status':    college.get('autonomy_status', 'N/A'),
                'hostel_available':   college.get('hostel_available', 'N/A'),
                'image':              college.get('image_url', ''),
                'total_intake':       int(college.get('total_intake', 0)),
                'seats':              int(college.get('seats', 0)),
                'average_package_lpa': float(college.get('average_package_lpa', 0)),
                'highest_package_lpa': float(college.get('highest_package_lpa', 0)),
                'university':         college.get('university', 'N/A'),
                'district':           college.get('district', 'N/A'),
                'region':             college.get('region', 'N/A'),
                'degree_type':        college.get('degree_type', 'N/A'),
                'accreditation':      college.get('accreditation', 'N/A')
            })

        print(f"Returning {len(frontend_colleges)} unique colleges")
        return jsonify(frontend_colleges)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@college_bp.route("/colleges/all_raw", methods=["GET"])
def get_colleges_all_raw():
    try:
        df = current_app.df
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@college_bp.route("/branches", methods=["GET"])
def get_branches():
    branches = sorted(current_app.df['branch_name'].unique().tolist())
    return jsonify({"branches": branches})


@college_bp.route("/cities", methods=["GET"])
def get_cities():
    cities = sorted(current_app.df['city'].unique().tolist())
    return jsonify({"cities": cities})


@college_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = sorted(current_app.df['category'].unique().tolist())
    return jsonify({"categories": categories})
