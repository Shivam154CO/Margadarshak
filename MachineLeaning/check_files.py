import os
import pandas as pd

# Check file paths
base_path = r"C:\ReactJS\SmartCF\MachineLeaning"
csv_file = "Maharashtra_Diploma_Dataset.csv"
csv_path = os.path.join(base_path, csv_file)

print("🔍 Checking files...\n")

# Check if directory exists
if os.path.exists(base_path):
    print(f"✅ Directory exists: {base_path}")
else:
    print(f"❌ Directory NOT found: {base_path}")
    exit(1)

# Check if CSV exists
if os.path.exists(csv_path):
    print(f"✅ CSV file found: {csv_file}")
    
    # Try to read it
    try:
        df = pd.read_csv(csv_path)
        print(f"✅ CSV loaded successfully!")
        print(f"   - Rows: {len(df)}")
        print(f"   - Columns: {len(df.columns)}")
        print(f"\n📋 Column names:")
        for col in df.columns:
            print(f"   - {col}")
        
        # Check for required columns
        required_cols = ['college_code', 'college_name', 'branch_name', 'city', 'cutoff_rank', 'Fees']
        missing = [col for col in required_cols if col not in df.columns]
        
        if missing:
            print(f"\n⚠️  Missing columns: {missing}")
        else:
            print(f"\n✅ All required columns present!")
            
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
else:
    print(f"❌ CSV file NOT found: {csv_file}")
    print(f"\n📁 Files in directory:")
    try:
        files = os.listdir(base_path)
        for f in files:
            print(f"   - {f}")
    except:
        print("   Could not list files")

# Check for model files
print("\n🤖 Checking model files:")
model_files = [
    "college_prediction_model.pkl",
    "label_encoders.pkl", 
    "target_encoder.pkl"
]

for mf in model_files:
    path = os.path.join(base_path, mf)
    if os.path.exists(path):
        print(f"✅ {mf} exists")
    else:
        print(f"❌ {mf} NOT found (will be created after training)")

print("\n" + "="*60)
print("NEXT STEPS:")
print("="*60)
if not os.path.exists(csv_path):
    print("1. ❌ Place your Maharashtra_Diploma_Dataset.csv file in:")
    print(f"   {base_path}")
elif not os.path.exists(os.path.join(base_path, "college_prediction_model.pkl")):
    print("1. ✅ CSV file found!")
    print("2. 🎓 Run: python train_model.py")
    print("3. 🚀 Then run: python ml_api.py")
else:
    print("✅ Everything is ready!")
    print("🚀 Run: python ml_api.py")