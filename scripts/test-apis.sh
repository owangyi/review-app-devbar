#!/bin/bash

##############################################################################
# API Testing Script for Review App DevBar
# Tests frontend pages and backend APIs
##############################################################################

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# Configuration
BASE_URL="${BASE_URL:-http://localhost}"
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-discovery.wang}"
API_DOMAIN="${API_DOMAIN:-api.discovery.wang}"

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

print_test() {
    echo -n "  ➤ $1 ... "
}

pass_test() {
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    ((TOTAL++))
}

fail_test() {
    echo -e "${RED}✗ FAILED${NC}"
    if [ -n "$1" ]; then
        echo -e "    ${RED}Error: $1${NC}"
    fi
    ((FAILED++))
    ((TOTAL++))
}

##############################################################################
# Test Functions
##############################################################################

test_frontend_page() {
    local branch=$1
    local expected_text=$2
    local description=$3
    
    print_test "$description"
    
    local host="${branch}.${FRONTEND_DOMAIN}"
    local response=$(curl -s -H "Host: $host" "$BASE_URL")
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $host" "$BASE_URL")
    
    if [ "$http_code" != "200" ]; then
        fail_test "HTTP $http_code"
        return
    fi
    
    if echo "$response" | grep -q "$expected_text"; then
        pass_test
    else
        fail_test "Expected text not found: $expected_text"
    fi
}

test_api_endpoint() {
    local branch=$1
    local endpoint=$2
    local expected_json=$3
    local description=$4
    
    print_test "$description"
    
    local host="${branch}.${API_DOMAIN}"
    local url="${BASE_URL}${endpoint}"
    local response=$(curl -s -H "Host: $host" "$url")
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $host" "$url")
    
    if [ "$http_code" != "200" ]; then
        fail_test "HTTP $http_code"
        return
    fi
    
    if echo "$response" | grep -q "$expected_json"; then
        pass_test
    else
        fail_test "Expected JSON not found: $expected_json"
        echo "    Response: ${response:0:200}..."
    fi
}

test_api_post() {
    local branch=$1
    local endpoint=$2
    local data=$3
    local expected=$4
    local description=$5
    
    print_test "$description"
    
    local host="${branch}.${API_DOMAIN}"
    local url="${BASE_URL}${endpoint}"
    local response=$(curl -s -X POST \
        -H "Host: $host" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$url")
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Host: $host" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$url")
    
    if [ "$http_code" != "200" ]; then
        fail_test "HTTP $http_code"
        return
    fi
    
    if echo "$response" | grep -q "$expected"; then
        pass_test
    else
        fail_test "Expected response not found: $expected"
    fi
}

test_cors_headers() {
    local branch=$1
    local endpoint=$2
    local description=$3
    
    print_test "$description"
    
    local host="${branch}.${API_DOMAIN}"
    local origin="http://${branch}.${FRONTEND_DOMAIN}"
    local url="${BASE_URL}${endpoint}"
    
    local cors_header=$(curl -s -I \
        -H "Host: $host" \
        -H "Origin: $origin" \
        "$url" | grep -i "access-control-allow-origin")
    
    if [ -n "$cors_header" ]; then
        pass_test
    else
        fail_test "CORS headers not found"
    fi
}

##############################################################################
# Main Test Execution
##############################################################################

main() {
    print_header "🧪 Review App DevBar - API Test Suite"
    
    echo "Configuration:"
    echo "  Base URL: $BASE_URL"
    echo "  Frontend Domain: $FRONTEND_DOMAIN"
    echo "  API Domain: $API_DOMAIN"
    echo ""
    
    # Test 1: Frontend Pages
    print_header "1️⃣  Frontend Pages Test"
    
    test_frontend_page "develop" "Review App DevBar Demo" \
        "Develop branch shows intro page"
    
    test_frontend_page "feature-dev-001" "Feature Branch" \
        "Feature branch shows feature page"
    
    test_frontend_page "feature-dev-002" "Feature Branch" \
        "Feature branch 002 shows feature page"
    
    # Test 2: Users API
    print_header "2️⃣  Users API Test"
    
    test_api_endpoint "feature-dev-001" "/api/users.php" '"success":true' \
        "GET /api/users.php returns success"
    
    test_api_endpoint "feature-dev-001" "/api/users.php" '"Alice Johnson"' \
        "User list contains Alice Johnson"
    
    test_api_endpoint "feature-dev-001" "/api/users.php" '"count":8' \
        "User list contains 8 users"
    
    # Test 3: User Status Toggle
    print_header "3️⃣  User Status Toggle Test"
    
    test_api_post "feature-dev-001" "/api/users.php" \
        '{"action":"toggle_status","user_id":1}' \
        '"success":true' \
        "POST toggle user status"
    
    # Verify the status changed
    sleep 1
    test_api_endpoint "feature-dev-001" "/api/users.php" '"success":true' \
        "Verify user list after toggle"
    
    # Test 4: Statistics API
    print_header "4️⃣  Statistics API Test"
    
    test_api_endpoint "feature-dev-001" "/api/statistics.php" '"success":true' \
        "GET /api/statistics.php returns success"
    
    test_api_endpoint "feature-dev-001" "/api/statistics.php" '"total_users"' \
        "Statistics contain total_users"
    
    test_api_endpoint "feature-dev-001" "/api/statistics.php" '"active_users"' \
        "Statistics contain active_users"
    
    test_api_endpoint "feature-dev-001" "/api/statistics.php" '"total_revenue"' \
        "Statistics contain total_revenue"
    
    # Test 5: Cross-Branch API
    print_header "5️⃣  Cross-Branch API Test"
    
    test_api_endpoint "develop" "/api/statistics.php" '"success":true' \
        "Develop API endpoint works"
    
    test_api_endpoint "feature-dev-002" "/api/statistics.php" '"success":true' \
        "Feature-dev-002 API endpoint works"
    
    # Test 6: CORS Headers
    print_header "6️⃣  CORS Headers Test"
    
    test_cors_headers "feature-dev-001" "/api/users.php" \
        "Users API has CORS headers"
    
    test_cors_headers "feature-dev-001" "/api/statistics.php" \
        "Statistics API has CORS headers"
    
    # Test 7: Error Handling
    print_header "7️⃣  Error Handling Test"
    
    print_test "Invalid user ID returns error"
    local response=$(curl -s -X POST \
        -H "Host: feature-dev-001.${API_DOMAIN}" \
        -H "Content-Type: application/json" \
        -d '{"action":"toggle_status","user_id":999}' \
        "${BASE_URL}/api/users.php")
    
    if echo "$response" | grep -q '"success":false'; then
        pass_test
    else
        fail_test "Expected error response"
    fi
    
    print_test "Missing action returns error"
    response=$(curl -s -X POST \
        -H "Host: feature-dev-001.${API_DOMAIN}" \
        -H "Content-Type: application/json" \
        -d '{"user_id":1}' \
        "${BASE_URL}/api/users.php")
    
    if echo "$response" | grep -q '"success":false'; then
        pass_test
    else
        fail_test "Expected error response"
    fi
    
    # Final Summary
    print_header "📊 Test Summary"
    
    echo "  Total Tests: $TOTAL"
    echo -e "  ${GREEN}Passed: $PASSED${NC}"
    echo -e "  ${RED}Failed: $FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✨ All tests passed! ✨${NC}"
        echo ""
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
        echo ""
        exit 1
    fi
}

##############################################################################
# Script Entry Point
##############################################################################

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is required but not installed.${NC}"
    exit 1
fi

# Run main function
main "$@"

