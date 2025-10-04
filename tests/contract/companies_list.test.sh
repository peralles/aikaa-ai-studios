#!/bin/bash
# Contract Test: GET /companies - List Companies with Pagination
# File: tests/contract/companies_list.test.sh
# Purpose: Test company listing endpoint with pagination

set -e

BASE_URL="http://localhost:3000/v1"
TEST_NAME="GET /companies - List Companies"

echo "🧪 Running Contract Test: $TEST_NAME"

# Test 1: Get companies with default pagination
echo "📋 Test 1: Get companies with default pagination"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/companies" \
  -H "Authorization: Bearer test-jwt-token")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Test 1 PASSED: Companies list returned 200"
  # Check if response has pagination structure
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

# Test 2: Get companies with custom pagination
echo "📋 Test 2: Get companies with custom pagination (page=1, per_page=5)"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/companies?page=1&per_page=5" \
  -H "Authorization: Bearer test-jwt-token")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Test 2 PASSED: Custom pagination returned 200"
  # Check pagination values
  if echo "$BODY" | grep -q '"page":1' && echo "$BODY" | grep -q '"per_page":5'; then
    echo "✅ Pagination parameters correctly applied"
  else
    echo "❌ Pagination parameters not correctly applied"
    exit 1
  fi
else
  echo "❌ Test 2 FAILED: Expected 200, got $HTTP_STATUS"
  exit 1
fi

# Test 3: Invalid pagination parameters  
echo "📋 Test 3: Invalid pagination parameters should return 400"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/companies?page=0&per_page=200" \
  -H "Authorization: Bearer test-jwt-token")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 400 ]; then
  echo "✅ Test 3 PASSED: Invalid pagination returned 400"
else
  echo "❌ Test 3 FAILED: Expected 400, got $HTTP_STATUS"
  exit 1
fi

# Test 4: Unauthorized access
echo "📋 Test 4: Unauthorized access should return 401"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/companies")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 401 ]; then
  echo "✅ Test 4 PASSED: Unauthorized request returned 401"
else
  echo "❌ Test 4 FAILED: Expected 401, got $HTTP_STATUS"
  exit 1
fi

echo "🎉 All contract tests passed for: $TEST_NAME"