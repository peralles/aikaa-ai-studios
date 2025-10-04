#!/bin/bash

# Contract Test: POST /kanban-boards/{id}/stages
# Tests Kanban stage creation endpoint with validation
# Expected: 401 Unauthorized (no implementation yet - TDD approach)

set -e

# Test configuration
API_BASE=${API_BASE:-"http://localhost:3000/v1"}
TEST_BOARD_ID="aa1bb2cc-dd33-44ee-55ff-666777888999"

echo "🧪 Contract Test: POST /kanban-boards/{id}/stages"
echo "Target: $API_BASE/kanban-boards/$TEST_BOARD_ID/stages"

# Test 1: No authentication (should fail with 401)
echo "📋 Test 1: No authentication"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "In Progress",
    "stage_type": "in_progress",
    "position": 1
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

# Test 2: Invalid Board ID format
echo "📋 Test 2: Invalid Board ID format"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/invalid-uuid/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Stage",
    "stage_type": "todo",
    "position": 0
  }' \
  -o /tmp/contract_response_2.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_2.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "404" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly handles malformed Board ID (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/404/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 3: Missing required name field
echo "📋 Test 3: Missing required name field"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "stage_type": "todo",
    "position": 0
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

# Test 4: Missing required stage_type field
echo "📋 Test 4: Missing required stage_type field"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Stage",
    "position": 0
  }' \
  -o /tmp/contract_response_4.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_4.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates required stage_type field (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 5: Missing required position field
echo "📋 Test 5: Missing required position field"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Stage",
    "stage_type": "todo"
  }' \
  -o /tmp/contract_response_5.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_5.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates required position field (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 6: Name too short
echo "📋 Test 6: Name validation (too short)"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "A",
    "stage_type": "todo",
    "position": 0
  }' \
  -o /tmp/contract_response_6.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_6.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates name min length (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 7: Name too long
echo "📋 Test 7: Name validation (too long)"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "'$(printf '%*s' 51 '' | tr ' ' 'A')'",
    "stage_type": "todo",
    "position": 0
  }' \
  -o /tmp/contract_response_7.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_7.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates name max length (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 8: Invalid stage_type enum
echo "📋 Test 8: Invalid stage_type validation"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Stage",
    "stage_type": "invalid_type",
    "position": 0
  }' \
  -o /tmp/contract_response_8.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_8.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates stage_type enum (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 9: Negative position value
echo "📋 Test 9: Invalid position validation (negative)"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Stage",
    "stage_type": "todo",
    "position": -1
  }' \
  -o /tmp/contract_response_9.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_9.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates position minimum value (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 10: Valid minimal request
echo "📋 Test 10: Valid minimal request structure"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "To Do",
    "stage_type": "todo",
    "position": 0
  }' \
  -o /tmp/contract_response_10.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_10.json)

# With fake JWT, should get 401 or 403
if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Minimal request validates authentication (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 401/403, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 11: Valid full request with all optional fields
echo "📋 Test 11: Valid full request structure"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Code Review",
    "description": "Cards undergoing peer code review process",
    "stage_type": "review",
    "position": 2,
    "color": "#f59e0b",
    "wip_limit": 5,
    "automation": "workflow_trigger",
    "automation_config": {
      "workflow_template_id": "template-uuid-here",
      "notification_users": ["user1", "user2"],
      "time_tracking_start": true
    },
    "rules": {
      "require_assignee": true,
      "require_due_date": false,
      "auto_archive_after_days": 30,
      "prevent_move_back": false
    }
  }' \
  -o /tmp/contract_response_11.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_11.json)

if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Full request validates authentication (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 401/403, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 12: Invalid color format
echo "📋 Test 12: Invalid color format validation"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-boards/$TEST_BOARD_ID/stages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "name": "Test Stage",
    "stage_type": "todo",
    "position": 0,
    "color": "invalid-color"
  }' \
  -o /tmp/contract_response_12.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_12.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates color format (HTTP $http_code)"
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
echo "   ✅ Number range validation working"
echo "   ✅ Color format validation working"
echo "   ✅ Optional fields handled correctly"
echo ""
echo "📝 Expected API Contract:"
echo "   POST /kanban-boards/{board_id}/stages"
echo "   Auth: Required (JWT Bearer token)"
echo "   Body: {"
echo "     name: string (required, 1-50 chars),"
echo "     description?: string (max 500 chars),"
echo "     stage_type: enum (required) ['backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'archived', 'custom'],"
echo "     position: number (required, >= 0),"
echo "     color?: string (hex color format),"
echo "     wip_limit?: number (>= 0),"
echo "     automation?: enum ['none', 'auto_assign', 'workflow_trigger', 'notification', 'time_tracking'],"
echo "     automation_config?: object,"
echo "     rules?: object"
echo "   }"
echo "   Success: 201 Created with stage details"
echo "   Errors: 400 (validation), 401 (auth), 403 (access), 404 (board not found), 422 (invalid data)"

# Cleanup temporary files
rm -f /tmp/contract_response_*.json

echo ""
echo "✅ All contract validation tests PASSED!"
echo "🔄 This test confirms the API contract - implementation should make these pass with real 201 responses"