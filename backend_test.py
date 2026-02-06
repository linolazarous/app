import requests
import sys
import json
import uuid
from datetime import datetime

class CursorCodeAPITester:
    def __init__(self, base_url="https://codeforge-260.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.project_id = None
        self.deployment_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.test_user_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_name = "Test User"
        self.test_user_password = "TestPass123!"

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and response.content:
                try:
                    response_data = response.json()
                    details += f" | Response: {json.dumps(response_data, indent=2)[:200]}..."
                    self.log_test(name, True, details)
                    return True, response_data
                except:
                    self.log_test(name, True, details)
                    return True, {}
            elif not success:
                try:
                    error_data = response.json()
                    details += f" | Error: {error_data}"
                except:
                    details += f" | Error: {response.text[:200]}"
                self.log_test(name, False, details)
                return False, {}
            else:
                self.log_test(name, True, details)
                return True, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_signup(self):
        """Test user signup"""
        test_user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Signup", "POST", "auth/signup", 200, test_user_data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        if not hasattr(self, '_signup_email'):
            # Use the same credentials from signup
            return False
            
        login_data = {
            "email": self._signup_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        if not self.token:
            self.log_test("Get Current User", False, "No auth token available")
            return False
        return self.run_test("Get Current User", "GET", "auth/me", 200)[0]

    def test_create_project(self):
        """Test project creation"""
        if not self.token:
            self.log_test("Create Project", False, "No auth token available")
            return False
            
        project_data = {
            "name": f"Test Project {datetime.now().strftime('%H%M%S')}",
            "description": "A test project for API testing",
            "prompt": "Create a simple React app"
        }
        
        success, response = self.run_test("Create Project", "POST", "projects", 200, project_data)
        if success and 'id' in response:
            self.project_id = response['id']
            return True
        return False

    def test_get_projects(self):
        """Test get user projects"""
        if not self.token:
            self.log_test("Get Projects", False, "No auth token available")
            return False
        return self.run_test("Get Projects", "GET", "projects", 200)[0]

    def test_get_project(self):
        """Test get specific project"""
        if not self.token or not self.project_id:
            self.log_test("Get Project", False, "No auth token or project ID available")
            return False
        return self.run_test("Get Project", "GET", f"projects/{self.project_id}", 200)[0]

    def test_ai_generate(self):
        """Test AI code generation (demo mode)"""
        if not self.token or not self.project_id:
            self.log_test("AI Generate", False, "No auth token or project ID available")
            return False
            
        generate_data = {
            "project_id": self.project_id,
            "prompt": "Create a simple React component with a button",
            "task_type": "code_generation"
        }
        
        return self.run_test("AI Generate Code", "POST", "ai/generate", 200, generate_data)[0]

    def test_get_plans(self):
        """Test get subscription plans"""
        return self.run_test("Get Plans", "GET", "plans", 200)[0]

    def test_get_ai_models(self):
        """Test get AI models"""
        return self.run_test("Get AI Models", "GET", "ai/models", 200)[0]

    def test_create_checkout(self):
        """Test create checkout session (demo mode)"""
        if not self.token:
            self.log_test("Create Checkout", False, "No auth token available")
            return False
            
        return self.run_test("Create Checkout", "POST", "subscriptions/create-checkout?plan=standard", 200)[0]

    def test_deploy_project(self):
        """Test project deployment"""
        if not self.token or not self.project_id:
            self.log_test("Deploy Project", False, "No auth token or project ID available")
            return False
            
        return self.run_test("Deploy Project", "POST", f"deploy/{self.project_id}", 200)[0]

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting CursorCode AI API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)

        # Basic health checks
        self.test_health_check()
        self.test_root_endpoint()

        # Authentication flow
        if self.test_signup():
            self.test_get_me()
            
            # Project management
            if self.test_create_project():
                self.test_get_projects()
                self.test_get_project()
                
                # AI features (demo mode)
                self.test_ai_generate()
                
                # Deployment
                self.test_deploy_project()

        # Public endpoints
        self.test_get_plans()
        self.test_get_ai_models()
        
        # Subscription (demo mode)
        if self.token:
            self.test_create_checkout()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            failed_tests = [t for t in self.test_results if not t['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return 1

def main():
    tester = CursorCodeAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())