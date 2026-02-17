import pandas as pd
import joblib
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# ✅ Load full dataset
csv_path = r"C:\ReactJS\SmartCF\MachineLeaning\Maharashtra_Diploma_Dataset.csv"

# Check if file exists
if not os.path.exists(csv_path):
    print(f"❌ ERROR: File not found at {csv_path}")
    print("Please ensure the CSV file exists at this location.")
    exit(1)

df = pd.read_csv(csv_path)

print(f"✅ Loaded dataset with {len(df)} rows and {len(df.columns)} columns")
print(f"✅ Unique colleges: {df['college_code'].nunique()}")
print(f"✅ Unique branches: {df['branch_name'].nunique() if 'branch_name' in df.columns else 'N/A'}")

# Keep original column names but strip whitespace
df.columns = df.columns.str.strip()

# Rename specific columns for consistency (capital to lowercase)
df.rename(columns={
    'Fees': 'fees',
    'Seats': 'seats'
}, inplace=True)

# ✅ CRITICAL FIX 1: Clean numeric columns properly
print("\n🔢 Cleaning and analyzing numeric columns...")

# Clean cutoff_rank
if 'cutoff_rank' in df.columns:
    # Convert to string first, then clean, then to numeric
    df['cutoff_rank'] = df['cutoff_rank'].astype(str)
    df['cutoff_rank'] = df['cutoff_rank'].replace(['N/A', 'NA', 'nan', 'NaN', '', ' ', 'NULL'], '0')
    df['cutoff_rank'] = pd.to_numeric(df['cutoff_rank'], errors='coerce').fillna(0).astype(int)
    
    # Analyze cutoff_rank distribution
    print(f"📊 Cutoff Rank Analysis:")
    print(f"   - Total records: {len(df)}")
    print(f"   - Non-zero cutoff_rank: {(df['cutoff_rank'] > 0).sum()} records")
    print(f"   - Min cutoff_rank: {df['cutoff_rank'].min()}")
    print(f"   - Max cutoff_rank: {df['cutoff_rank'].max()}")
    print(f"   - Mean cutoff_rank: {df['cutoff_rank'].mean():.1f}")
    print(f"   - Median cutoff_rank: {df['cutoff_rank'].median()}")
    
    # Show distribution
    bins = [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000, df['cutoff_rank'].max()]
    labels = ['0-1k', '1k-2k', '2k-5k', '5k-10k', '10k-20k', '20k-50k', '50k-100k', '100k+']
    df['cutoff_bin'] = pd.cut(df['cutoff_rank'], bins=bins, labels=labels, include_lowest=True)
    bin_counts = df['cutoff_bin'].value_counts().sort_index()
    print(f"   - Distribution:")
    for bin_label, count in bin_counts.items():
        percentage = (count / len(df)) * 100
        print(f"     {bin_label}: {count} records ({percentage:.1f}%)")

# Clean other numeric columns
numeric_cols = ['fees', 'seats', 'placement_rate', 'cutoff_percentile', 
                'average_package_lpa', 'highest_package_lpa', 'internship_rate']
for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# ✅ Handle missing values for categorical columns
df.fillna({
    'hostel_available': 'No',
    'autonomy_status': 'Non-Autonomous',
    'category': 'OPEN',
    'city': 'Unknown',
    'branch_name': 'Unknown'
}, inplace=True)

# ✅ Select relevant features for prediction
feature_columns = [
    'city', 
    'branch_name',  # Using branch_name from your CSV
    'category', 
    'year', 
    'fees',  # Using fees from your CSV
    'placement_rate', 
    'hostel_available', 
    'autonomy_status', 
    'cutoff_rank'  # Using cutoff_rank
]

print(f"\n✅ Selected features: {feature_columns}")

# ✅ Filter dataframe to include only selected features
df_filtered = df[feature_columns].copy()

print(f"✅ Training dataset shape: {df_filtered.shape}")
print(f"✅ This includes all {len(df_filtered)} records (with branch variations)")

# ✅ Auto-detect categorical columns
cat_cols = df_filtered.select_dtypes(include=["object"]).columns.tolist()
print(f"✅ Categorical columns to encode: {cat_cols}")

# ✅ Label-encode all categorical columns
label_encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    df_filtered[col] = le.fit_transform(df_filtered[col].astype(str))
    label_encoders[col] = le
    print(f"   - Encoded {col}: {len(le.classes_)} unique values")

# ✅ Features (X)
X = df_filtered.copy()

# ✅ CRITICAL FIX 2: Define target (y) based on intelligent thresholds
print(f"\n🎯 Defining target variable based on cutoff_rank...")
print(f"   Using cutoff_rank from df_filtered (not original df)")

# Get cutoff_rank values from df_filtered (already cleaned)
cutoff_values = df_filtered['cutoff_rank'].values

# Analyze cutoff rank distribution to set intelligent thresholds
cutoff_non_zero = cutoff_values[cutoff_values > 0]
if len(cutoff_non_zero) > 0:
    q1 = np.percentile(cutoff_non_zero, 25)
    median = np.percentile(cutoff_non_zero, 50)
    q3 = np.percentile(cutoff_non_zero, 75)
    
    print(f"📊 Cutoff Rank Statistics (non-zero only):")
    print(f"   - 25th percentile (Q1): {q1:.0f}")
    print(f"   - 50th percentile (Median): {median:.0f}")
    print(f"   - 75th percentile (Q3): {q3:.0f}")
    print(f"   - 90th percentile: {np.percentile(cutoff_non_zero, 90):.0f}")
    
    # Set thresholds based on percentiles
    best_fit_threshold = q1  # Top 25%
    good_fit_threshold = median  # Top 50%
    stretch_threshold = q3  # Top 75%
    
    print(f"\n🎯 Setting thresholds:")
    print(f"   - Best Fit: cutoff_rank <= {best_fit_threshold:.0f} (top 25%)")
    print(f"   - Good Fit: cutoff_rank <= {good_fit_threshold:.0f} (top 50%)")
    print(f"   - Stretch: cutoff_rank <= {stretch_threshold:.0f} (top 75%)")
    print(f"   - Unlikely Fit: cutoff_rank > {stretch_threshold:.0f}")
else:
    print("⚠️ Warning: No non-zero cutoff_rank values found!")
    # Use default thresholds
    best_fit_threshold = 2000
    good_fit_threshold = 5000
    stretch_threshold = 10000

# Create target variable
y = []
for score in cutoff_values:
    if score <= 0:
        # If no cutoff data, classify as "Unknown Fit"
        y.append("Unknown Fit")
    elif score <= best_fit_threshold:
        y.append("Best Fit")
    elif score <= good_fit_threshold:
        y.append("Good Fit")
    elif score <= stretch_threshold:
        y.append("Stretch")
    else:
        y.append("Unlikely Fit")

# ✅ Encode target
target_enc = LabelEncoder()
y_encoded = target_enc.fit_transform(y)

print(f"\n✅ Target distribution:")
target_dist = pd.Series(y).value_counts().sort_index()
for label, count in target_dist.items():
    percentage = (count / len(y)) * 100
    print(f"   - {label}: {count} records ({percentage:.1f}%)")

# ✅ Check if we have enough samples for each class
print(f"\n🔍 Checking class balance...")
min_samples = min(target_dist.values)
if min_samples < 100:
    print(f"⚠️ Warning: Some classes have very few samples (<100)")
    print(f"   Consider adjusting thresholds or collecting more data")

# ✅ Split data (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, 
    test_size=0.2, 
    random_state=42,
    stratify=y_encoded  # Ensures balanced split across all categories
)

print(f"\n✅ Train set: {len(X_train)} records")
print(f"✅ Test set: {len(X_test)} records")

# ✅ Check train set distribution
train_dist = pd.Series(target_enc.inverse_transform(y_train)).value_counts().sort_index()
print(f"\n📊 Train set distribution:")
for label, count in train_dist.items():
    percentage = (count / len(y_train)) * 100
    print(f"   - {label}: {count} records ({percentage:.1f}%)")

# ✅ Train Random Forest model
print("\n🎓 Training Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=200,      # More trees for better accuracy
    random_state=42, 
    max_depth=15,          # Prevent overfitting
    min_samples_split=10,  # Minimum samples to split a node
    min_samples_leaf=5,    # Minimum samples in leaf node
    n_jobs=-1,             # Use all CPU cores
    class_weight='balanced'  # Handle class imbalance
)

model.fit(X_train, y_train)
print("✅ Model training complete!")

# ✅ Evaluate on test set
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n🎯 Model Accuracy: {round(accuracy * 100, 2)}%")

print("\n📊 Classification Report:")
print(classification_report(
    y_test, 
    y_pred, 
    target_names=target_enc.classes_,
    digits=3
))

# ✅ Feature importance analysis
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n🎯 Feature Importance (Top to Bottom):")
for idx, row in feature_importance.iterrows():
    print(f"   {row['feature']}: {row['importance']:.4f}")

# ✅ Save model & encoders
save_dir = os.path.dirname(csv_path)

model_path = os.path.join(save_dir, "college_prediction_model.pkl")
encoders_path = os.path.join(save_dir, "label_encoders.pkl")
target_path = os.path.join(save_dir, "target_encoder.pkl")

joblib.dump(model, model_path)
joblib.dump(label_encoders, encoders_path)
joblib.dump(target_enc, target_path)

print(f"\n💾 Model saved to: {model_path}")
print(f"💾 Label encoders saved to: {encoders_path}")
print(f"💾 Target encoder saved to: {target_path}")

# ✅ Verification
print("\n✅ Model Verification:")
print(f"   - Model expects {len(feature_columns)} features: {feature_columns}")
print(f"   - Feature names in model: {model.feature_names_in_ if hasattr(model, 'feature_names_in_') else 'Not available'}")
print(f"   - Encoders available for: {list(label_encoders.keys())}")
print(f"   - Target classes: {list(target_enc.classes_)}")

# ✅ Test prediction with sample data
print("\n🧪 Testing model with sample prediction...")
try:
    # Create a sample prediction
    sample_data = X_train.iloc[0:1].copy()
    prediction_encoded = model.predict(sample_data)[0]
    prediction_label = target_enc.inverse_transform([prediction_encoded])[0]
    
    print(f"   Sample prediction: {prediction_label}")
    print(f"   Sample features:")
    for col in feature_columns:
        if col in label_encoders:
            # Decode categorical features
            encoder = label_encoders[col]
            encoded_val = sample_data[col].values[0]
            try:
                decoded_val = encoder.inverse_transform([int(encoded_val)])[0]
                print(f"     {col}: {decoded_val}")
            except:
                print(f"     {col}: {encoded_val}")
        else:
            print(f"     {col}: {sample_data[col].values[0]}")
except Exception as e:
    print(f"⚠️ Sample prediction test failed: {e}")

print("\n🎓 Training complete! Model is ready for use.")
print("\n📝 Important Notes:")
print("   1. Model trained on ALL records including branch variations")
print("   2. Target defined based on cutoff_rank percentiles (adaptive thresholds)")
print("   3. Class weights balanced to handle imbalanced data")
print("   4. All categorical columns properly encoded")
print("   5. Flask API will handle deduplication for display purposes")

# ✅ Create a simple test to verify the model works with Flask
print("\n🧪 Flask Compatibility Test:")
print("   To test if this model works with your Flask API, check these:")
print("   1. Feature names match: city, branch_name, category, year, fees, placement_rate, hostel_available, autonomy_status, cutoff_rank")
print("   2. All encoders are saved correctly")
print("   3. Target classes are: Best Fit, Good Fit, Stretch, Unlikely Fit, Unknown Fit")
print("\n✅ If all these match, your Flask API should work correctly with this model!")