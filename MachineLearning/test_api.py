import requests
import json

# Test API endpoints
BASE_URL = "http://localhost:5001"

def test_server_running():
    """Test if server is running"""
    try:
        response = requests.get(f"{BASE_URL}/stats", timeout=5)
        print(f"✅ Server is running: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Server is NOT running. Start it with: python app.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False

def test_branches():
    """Test branches endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/branches")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Branches endpoint working: {len(data.get('branches', []))} branches")
            print(f"   Sample: {data.get('branches', [])[:3]}")
            return True
        else:
            print(f"❌ Branches endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing branches: {e}")
        return False

def test_cities():
    """Test cities endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/cities")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Cities endpoint working: {len(data.get('cities', []))} cities")
            return True
        else:
            print(f"❌ Cities endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing cities: {e}")
        return False

def test_prediction():
    """Test prediction endpoint"""
    try:
        test_data = {
            "rank": 2500,
            "percentile": 88,
            "branch": "Computer Engineering",
            "category": "OPEN",
            "max_fees": 150000
        }
        
        print("\n📤 Sending prediction request:")
        print(json.dumps(test_data, indent=2))
        
        response = requests.post(
            f"{BASE_URL}/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prediction successful!")
            print(f"   Total matches: {data.get('summary', {}).get('total_matches', 0)}")
            print(f"   Best fit: {data.get('summary', {}).get('best_fit_count', 0)}")
            print(f"   Recommendations: {len(data.get('recommendations', []))}")
            if data.get('recommendations'):
                print(f"\n   Top recommendation:")
                top = data['recommendations'][0]
                print(f"   - {top.get('college_name')}")
                print(f"   - Fit: {top.get('fit_category')}")
                print(f"   - Match Score: {top.get('match_score')}")
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Prediction request timed out (>30s)")
        return False
    except Exception as e:
        print(f"❌ Error testing prediction: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_colleges():
    """Test colleges endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/colleges?limit=10")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Colleges endpoint working: {data.get('total', 0)} colleges")
            return True
        else:
            print(f"❌ Colleges endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing colleges: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 API Testing Suite")
    print("=" * 60)
    
    results = []
    
    # Test 1: Server running
    print("\n1️⃣ Testing if server is running...")
    if not test_server_running():
        print("\n❌ CRITICAL: Start your Flask server first!")
        print("   Run: python app.py")
        exit(1)
    results.append(("Server", True))
    
    # Test 2: Branches
    print("\n2️⃣ Testing branches endpoint...")
    results.append(("Branches", test_branches()))
    
    # Test 3: Cities
    print("\n3️⃣ Testing cities endpoint...")
    results.append(("Cities", test_cities()))
    
    # Test 4: Colleges
    print("\n4️⃣ Testing colleges endpoint...")
    results.append(("Colleges", test_colleges()))
    
    # Test 5: Prediction (most important)
    print("\n5️⃣ Testing prediction endpoint...")
    results.append(("Prediction", test_prediction()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    for name, status in results:
        icon = "✅" if status else "❌"
        print(f"{icon} {name}: {'PASSED' if status else 'FAILED'}")
    
    passed = sum(1 for _, status in results if status)
    total = len(results)
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your API is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")