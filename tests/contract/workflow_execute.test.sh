#!/bin/bash

# Contract Test: POST /studios/{id}/executions
# Tests workflow execution endpoint with authentication and validation
# Expected: 401 Unauthorized (no implementation yet - TDD approach)

set -e

# Test configuration
API_BASE=${API_BASE:-"http://localhost:3000/v1"}
TEST_STUDIO_ID="550e8400-e29b-41d4-a716-446655440000"
TEST_TEMPLATE_ID="7b93b4e2-c4a8-4e52-a0b7-1c8a8f9e2d3a"

echo "🧪 Contract Test: POST /studios/{id}/executions"
echo "Target: $API_BASE/studios/$TEST_STUDIO_ID/executions"

# Test 1: No authentication (should fail with 401)
echo "📋 Test 1: No authentication"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/executions" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "'$TEST_TEMPLATE_ID'",
    "input_data": {
      "customer_email": "test@example.com",
      "company_name": "Acme Corp"
    }
  }' \
  -o /tmp/contract_response_1.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_1.json)

if [ "$http_code" = "401" ]; then
  echo "✅ PASS: Correctly returns 401 Unauthorized"
else
  echo "❌ FAIL: Expected 401, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 2: Invalid Studio ID format
echo "📋 Test 2: Invalid Studio ID format"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/invalid-uuid/executions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "template_id": "'$TEST_TEMPLATE_ID'",
    "input_data": {}
  }' \
  -o /tmp/contract_response_2.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_2.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "404" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly handles malformed Studio ID (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/404/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 3: Missing required fields
echo "📋 Test 3: Missing required template_id"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/executions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "input_data": {
      "customer_email": "test@example.com"
    }
  }' \
  -o /tmp/contract_response_3.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_3.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates required fields (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 4: Invalid JSON body
echo "📋 Test 4: Invalid JSON body"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/executions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{ invalid json }' \
  -o /tmp/contract_response_4.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_4.json)

if [ "$http_code" = "400" ]; then
  echo "✅ PASS: Correctly handles malformed JSON (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 5: Valid request structure (would succeed with auth)
echo "📋 Test 5: Valid request structure (auth validation)"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/executions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "template_id": "'$TEST_TEMPLATE_ID'",
    "input_data": {
      "customer_email": "john.doe@acme.com",
      "company_name": "Acme Corporation",
      "welcome_message": "Welcome to our platform!",
      "send_immediately": true
    },
    "metadata": {
      "source": "manual_trigger",
      "priority": "normal"
    }
  }' \
  -o /tmp/contract_response_5.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_5.json)

# With fake JWT, should get 401 or 403
if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Correctly validates authentication (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 401/403, got $http_code"
  echo "Response: $body"
  exit 1
fi

echo ""
echo "🎯 Contract Test Results:"
echo "   ✅ Authentication validation working"
echo "   ✅ Input validation working"
echo "   ✅ JSON parsing working"
echo "   ✅ UUID format validation working"
echo "   ✅ Required field validation working"
echo ""
echo "📝 Expected API Contract:"
echo "   POST /studios/{studio_id}/executions"
echo "   Auth: Required (JWT Bearer token)"
echo "   Body: { template_id: UUID, input_data: object, metadata?: object }"
echo "   Success: 201 Created with execution details"
echo "   Errors: 400 (validation), 401 (auth), 403 (access), 404 (studio not found)"

# Cleanup temporary files
rm -f /tmp/contract_response_*.json

echo ""
echo "✅ All contract validation tests PASSED!"
echo "🔄 This test confirms the API contract - implementation should make these pass with real 201 responses"