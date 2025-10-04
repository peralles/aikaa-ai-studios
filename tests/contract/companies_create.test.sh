#!/bin/bash
# Contract Test: POST /companies - Create Company
# File: tests/contract/companies_create.test.sh
# Purpose: Test company creation endpoint validation

set -e

BASE_URL="http://localhost:3000/v1"
TEST_NAME="POST /companies - Create Company"

echo "🧪 Running Contract Test: $TEST_NAME"

# Test 1: Valid company creation
echo "📋 Test 1: Valid company creation"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt-token" \
  -d '{
    "name": "Test Company Ltd",
    "industry_type": "technology",
    "contact_email": "contact@testcompany.com",
    "contact_phone": "+1234567890",
    "headquarters_address": "123 Main Street, Test City, TC 12345"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$HTTP_STATUS" -eq 201 ]; then
  echo "✅ Test 1 PASSED: Company creation returned 201"
  echo "   Response: $BODY"
else
  echo "❌ Test 1 FAILED: Expected 201, got $HTTP_STATUS"
  echo "   Response: $BODY"
  exit 1
fi

# Test 2: Invalid email format
echo "📋 Test 2: Invalid email format should return 400"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt-token" \
  -d '{
    "name": "Test Company 2",
    "industry_type": "technology", 
    "contact_email": "invalid-email",
    "headquarters_address": "123 Main Street, Test City, TC 12345"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 400 ]; then
  echo "✅ Test 2 PASSED: Invalid email returned 400"
else
  echo "❌ Test 2 FAILED: Expected 400, got $HTTP_STATUS"
  exit 1
fi

# Test 3: Missing required fields
echo "📋 Test 3: Missing required fields should return 400"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-jwt-token" \
  -d '{
    "name": "Test Company 3"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 400 ]; then
  echo "✅ Test 3 PASSED: Missing fields returned 400"
else
  echo "❌ Test 3 FAILED: Expected 400, got $HTTP_STATUS"
  exit 1
fi

# Test 4: Unauthorized access
echo "📋 Test 4: Unauthorized access should return 401"  
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Company",
    "industry_type": "technology",
    "contact_email": "test@unauthorized.com",
    "headquarters_address": "123 Unauthorized Street"
  }')

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 401 ]; then
  echo "✅ Test 4 PASSED: Unauthorized request returned 401"
else
  echo "❌ Test 4 FAILED: Expected 401, got $HTTP_STATUS"
  exit 1
fi

echo "🎉 All contract tests passed for: $TEST_NAME"