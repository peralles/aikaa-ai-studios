#!/bin/bash
# Contract Test: POST /companies/{id}/studios - Create Studio
# File: tests/contract/studios_create.test.sh
# Purpose: Test studio creation endpoint within company

set -e

BASE_URL="http://localhost:3000/v1"
TEST_NAME="POST /companies/{id}/studios - Create Studio"
TEST_COMPANY_ID="550e8400-e29b-41d4-a716-446655440000"

echo "🧪 Running Contract Test: $TEST_NAME"

# Test 1: Valid studio creation
echo "📋 Test 1: Valid studio creation"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies/$TEST_COMPANY_ID/studios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt-token" \
  -d '{
    "name": "Marketing Automation Studio",
    "description": "Studio for marketing workflow automation",
    "business_area": "marketing"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$HTTP_STATUS" -eq 201 ]; then
  echo "✅ Test 1 PASSED: Studio creation returned 201"
  echo "   Response: $BODY"
else
  echo "❌ Test 1 FAILED: Expected 201, got $HTTP_STATUS"
  echo "   Response: $BODY"
  exit 1
fi

# Test 2: Invalid business area
echo "📋 Test 2: Invalid business area should return 400"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies/$TEST_COMPANY_ID/studios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt-token" \
  -d '{
    "name": "Invalid Studio",
    "business_area": "invalid_area"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 400 ]; then
  echo "✅ Test 2 PASSED: Invalid business area returned 400"
else
  echo "❌ Test 2 FAILED: Expected 400, got $HTTP_STATUS"
  exit 1
fi

# Test 3: Missing required name field
echo "📋 Test 3: Missing required name field should return 400"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies/$TEST_COMPANY_ID/studios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt-token" \
  -d '{
    "business_area": "sales"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 400 ]; then
  echo "✅ Test 3 PASSED: Missing name field returned 400"
else
  echo "❌ Test 3 FAILED: Expected 400, got $HTTP_STATUS"
  exit 1
fi

# Test 4: Non-existent company ID
echo "📋 Test 4: Non-existent company ID should return 404"
NON_EXISTENT_ID="00000000-0000-0000-0000-000000000000"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies/$NON_EXISTENT_ID/studios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt-token" \
  -d '{
    "name": "Test Studio",
    "business_area": "operations"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 404 ]; then
  echo "✅ Test 4 PASSED: Non-existent company returned 404"
else
  echo "❌ Test 4 FAILED: Expected 404, got $HTTP_STATUS"
  exit 1
fi

# Test 5: Unauthorized access
echo "📋 Test 5: Unauthorized access should return 401"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies/$TEST_COMPANY_ID/studios" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Studio",
    "business_area": "finance"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 401 ]; then
  echo "✅ Test 5 PASSED: Unauthorized request returned 401"
else
  echo "❌ Test 5 FAILED: Expected 401, got $HTTP_STATUS"
  exit 1
fi

echo "🎉 All contract tests passed for: $TEST_NAME"