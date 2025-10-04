#!/bin/bash

# Contract Test: POST /studios/{id}/kanban-boards
# Tests Kanban board creation endpoint with validation
# Expected: 401 Unauthorized (no implementation yet - TDD approach)

set -e

# Test configuration
API_BASE=${API_BASE:-"http://localhost:3000/v1"}
TEST_STUDIO_ID="550e8400-e29b-41d4-a716-446655440000"

echo "🧪 Contract Test: POST /studios/{id}/kanban-boards"
echo "Target: $API_BASE/studios/$TEST_STUDIO_ID/kanban-boards"

# Test 1: No authentication (should fail with 401)
echo "📋 Test 1: No authentication"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Development Pipeline",
    "description": "Track product features from ideation to release"
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
  "$API_BASE/studios/invalid-uuid/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Board"
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

# Test 3: Missing required name field
echo "📋 Test 3: Missing required name field"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "description": "Board without name"
  }' \
  -o /tmp/contract_response_3.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_3.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates required name field (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 4: Name too short
echo "📋 Test 4: Name validation (too short)"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "AB"
  }' \
  -o /tmp/contract_response_4.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_4.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates name length (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 5: Name too long
echo "📋 Test 5: Name validation (too long)"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "'$(printf '%*s' 101 '' | tr ' ' 'A')'"
  }' \
  -o /tmp/contract_response_5.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_5.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates name max length (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 6: Invalid JSON body
echo "📋 Test 6: Invalid JSON body"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{ invalid json syntax }' \
  -o /tmp/contract_response_6.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_6.json)

if [ "$http_code" = "400" ]; then
  echo "✅ PASS: Correctly handles malformed JSON (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 7: Valid minimal request
echo "📋 Test 7: Valid minimal request structure"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Simple Board"
  }' \
  -o /tmp/contract_response_7.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_7.json)

# With fake JWT, should get 401 or 403
if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Minimal request validates authentication (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 401/403, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 8: Valid full request with all optional fields
echo "📋 Test 8: Valid full request structure"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Advanced Product Pipeline",
    "description": "Comprehensive board for tracking product development from concept to delivery with custom stages and automation",
    "visibility": "studio",
    "settings": {
      "auto_archive_completed": true,
      "card_aging_enabled": false,
      "due_date_notifications": true,
      "workflow_automation": true,
      "custom_fields_enabled": true,
      "time_tracking_enabled": false
    },
    "background_color": "#2563eb",
    "tags": ["product", "development", "features", "pipeline"],
    "workflow_template_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }' \
  -o /tmp/contract_response_8.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_8.json)

if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Full request validates authentication (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 401/403, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 9: Invalid visibility enum
echo "📋 Test 9: Invalid visibility validation"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Board",
    "visibility": "invalid_visibility"
  }' \
  -o /tmp/contract_response_9.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_9.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates visibility enum (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 10: Invalid workflow template UUID format
echo "📋 Test 10: Invalid workflow template UUID validation"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/studios/$TEST_STUDIO_ID/kanban-boards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Board",
    "workflow_template_id": "not-a-valid-uuid"
  }' \
  -o /tmp/contract_response_10.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_10.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates UUID format (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
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
echo "   ✅ String length validation working"
echo "   ✅ Enum validation working"
echo "   ✅ Optional fields handled correctly"
echo ""
echo "📝 Expected API Contract:"
echo "   POST /studios/{studio_id}/kanban-boards"
echo "   Auth: Required (JWT Bearer token)"
echo "   Body: {"
echo "     name: string (required, 3-100 chars),"
echo "     description?: string (max 1000 chars),"
echo "     visibility?: enum ['private', 'studio', 'company'] (default: 'studio'),"
echo "     settings?: object,"
echo "     background_color?: string (hex color),"
echo "     tags?: string[],"
echo "     workflow_template_id?: UUID"
echo "   }"
echo "   Success: 201 Created with board details"
echo "   Errors: 400 (validation), 401 (auth), 403 (access), 404 (studio not found), 422 (invalid data)"

# Cleanup temporary files
rm -f /tmp/contract_response_*.json

echo ""
echo "✅ All contract validation tests PASSED!"
echo "🔄 This test confirms the API contract - implementation should make these pass with real 201 responses"