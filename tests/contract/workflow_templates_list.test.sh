#!/bin/bash
# Contract Test: GET /workflow-templates - List Workflow Templates
# File: tests/contract/workflow_templates_list.test.sh  
# Purpose: Test workflow template discovery with filtering

set -e

BASE_URL="http://localhost:3000/v1"
TEST_NAME="GET /workflow-templates - List Templates"

echo "🧪 Running Contract Test: $TEST_NAME"

# Test 1: Get all templates with default pagination
echo "📋 Test 1: Get all templates with default pagination"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/workflow-templates" \
  -H "Authorization: Bearer test-jwt-token")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Test 1 PASSED: Templates list returned 200"
  # Check pagination structure
  if echo "$BODY" | grep -q '"data"' && echo "$BODY" | grep -q '"pagination"'; then
    echo "✅ Response has correct pagination structure"
  else
    echo "❌ Response missing pagination structure"
    exit 1
  fi
else
  echo "❌ Test 1 FAILED: Expected 200, got $HTTP_STATUS"
  echo "   Response: $BODY"
  exit 1
fi

# Test 2: Filter by business area
echo "📋 Test 2: Filter by business area (marketing)"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/workflow-templates?business_area=marketing" \
  -H "Authorization: Bearer test-jwt-token")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Test 2 PASSED: Business area filter returned 200"
else
  echo "❌ Test 2 FAILED: Expected 200, got $HTTP_STATUS"
  exit 1
fi

# Test 3: Filter by complexity level
echo "📋 Test 3: Filter by complexity level (beginner)"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/workflow-templates?complexity_level=beginner" \
  -H "Authorization: Bearer test-jwt-token")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Test 3 PASSED: Complexity filter returned 200"
else
  echo "❌ Test 3 FAILED: Expected 200, got $HTTP_STATUS"
  exit 1
fi

# Test 4: Search by name/description
echo "📋 Test 4: Search by name/description"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/workflow-templates?search=automation" \
  -H "Authorization: Bearer test-jwt-token")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Test 4 PASSED: Search query returned 200"
else
  echo "❌ Test 4 FAILED: Expected 200, got $HTTP_STATUS"
  exit 1
fi

# Test 5: Invalid business area filter
echo "📋 Test 5: Invalid business area should return 400"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/workflow-templates?business_area=invalid" \
  -H "Authorization: Bearer test-jwt-token")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 400 ]; then
  echo "✅ Test 5 PASSED: Invalid filter returned 400"
else
  echo "❌ Test 5 FAILED: Expected 400, got $HTTP_STATUS"
  exit 1
fi

# Test 6: Unauthorized access
echo "📋 Test 6: Unauthorized access should return 401"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/workflow-templates")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 401 ]; then
  echo "✅ Test 6 PASSED: Unauthorized request returned 401"
else
  echo "❌ Test 6 FAILED: Expected 401, got $HTTP_STATUS"
  exit 1
fi

echo "🎉 All contract tests passed for: $TEST_NAME"