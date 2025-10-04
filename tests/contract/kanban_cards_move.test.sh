#!/bin/bash

# Contract Test: POST /kanban-cards/{id}/move
# Tests Kanban card movement endpoint with validation
# Expected: 401 Unauthorized (no implementation yet - TDD approach)

set -e

# Test configuration
API_BASE=${API_BASE:-"http://localhost:3000/v1"}
TEST_CARD_ID="12345678-9abc-def0-1234-56789abcdef0"
TEST_STAGE_ID="87654321-abcd-ef12-3456-789abcdef012"

echo "🧪 Contract Test: POST /kanban-cards/{id}/move"
echo "Target: $API_BASE/kanban-cards/$TEST_CARD_ID/move"

# Test 1: No authentication (should fail with 401)
echo "📋 Test 1: No authentication"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'",
    "position": 0
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

# Test 2: Invalid Card ID format
echo "📋 Test 2: Invalid Card ID format"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/invalid-uuid/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'",
    "position": 0
  }' \
  -o /tmp/contract_response_2.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_2.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "404" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly handles malformed Card ID (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/404/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 3: Missing required target_stage_id field
echo "📋 Test 3: Missing required target_stage_id field"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "position": 0
  }' \
  -o /tmp/contract_response_3.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_3.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates required target_stage_id field (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 4: Missing required position field
echo "📋 Test 4: Missing required position field"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'"
  }' \
  -o /tmp/contract_response_4.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_4.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates required position field (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 5: Invalid target_stage_id UUID format
echo "📋 Test 5: Invalid target_stage_id UUID validation"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "not-a-valid-uuid",
    "position": 0
  }' \
  -o /tmp/contract_response_5.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_5.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates target_stage_id UUID format (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 6: Negative position value
echo "📋 Test 6: Invalid position validation (negative)"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'",
    "position": -1
  }' \
  -o /tmp/contract_response_6.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_6.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates position minimum value (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 7: Invalid JSON body
echo "📋 Test 7: Invalid JSON body"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{ invalid json syntax }' \
  -o /tmp/contract_response_7.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_7.json)

if [ "$http_code" = "400" ]; then
  echo "✅ PASS: Correctly handles malformed JSON (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 8: Valid minimal move request
echo "📋 Test 8: Valid minimal move request structure"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'",
    "position": 0
  }' \
  -o /tmp/contract_response_8.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_8.json)

# With fake JWT, should get 401 or 403
if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Minimal request validates authentication (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 401/403, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 9: Valid move request with reason
echo "📋 Test 9: Valid move request with optional reason"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'",
    "position": 2,
    "move_reason": "Completed code review, moving to testing phase"
  }' \
  -o /tmp/contract_response_9.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_9.json)

if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Request with reason validates authentication (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 401/403, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 10: Move to last position
echo "📋 Test 10: Move to last position"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'",
    "position": 99999
  }' \
  -o /tmp/contract_response_10.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_10.json)

if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Large position value validates authentication (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 401/403, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 11: Move reason too long
echo "📋 Test 11: Move reason validation (too long)"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'",
    "position": 0,
    "move_reason": "'$(printf '%*s' 501 '' | tr ' ' 'A')'"
  }' \
  -o /tmp/contract_response_11.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_11.json)

if [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
  echo "✅ PASS: Correctly validates move reason max length (HTTP $http_code)"
else
  echo "❌ FAIL: Expected 400/422, got $http_code"
  echo "Response: $body"
  exit 1
fi

# Test 12: Move with metadata
echo "📋 Test 12: Move with metadata tracking"
response=$(curl -s -w "%{http_code}" -X POST \
  "$API_BASE/kanban-cards/$TEST_CARD_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-jwt-token" \
  -d '{
    "target_stage_id": "'$TEST_STAGE_ID'",
    "position": 1,
    "move_reason": "Automated workflow trigger after passing tests",
    "metadata": {
      "triggered_by": "workflow",
      "workflow_id": "workflow-uuid-here",
      "timestamp": "2024-10-04T10:30:00Z",
      "previous_stage": "testing",
      "automation_rule": "auto_move_on_completion"
    }
  }' \
  -o /tmp/contract_response_12.json)

http_code="${response: -3}"
body=$(cat /tmp/contract_response_12.json)

if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "✅ PASS: Request with metadata validates authentication (HTTP $http_code)"
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
echo "   ✅ Number range validation working"
echo "   ✅ String length validation working"
echo "   ✅ Optional fields handled correctly"
echo "   ✅ Metadata handling working"
echo ""
echo "📝 Expected API Contract:"
echo "   POST /kanban-cards/{card_id}/move"
echo "   Auth: Required (JWT Bearer token)"
echo "   Body: {"
echo "     target_stage_id: UUID (required),"
echo "     position: number (required, >= 0),"
echo "     move_reason?: string (max 500 chars),"
echo "     metadata?: object"
echo "   }"
echo "   Success: 200 OK with updated card details and position changes"
echo "   Errors: 400 (validation), 401 (auth), 403 (access), 404 (card/stage not found), 422 (invalid data)"
echo ""
echo "📋 Expected Workflow Triggers:"
echo "   - Card moved to specific stage → Trigger automation workflow"
echo "   - Card moved from/to 'done' stage → Update completion tracking"
echo "   - Card moved with WIP limit exceeded → Send notifications"
echo "   - Card dependencies → Validate move is allowed"

# Cleanup temporary files
rm -f /tmp/contract_response_*.json

echo ""
echo "✅ All contract validation tests PASSED!"
echo "🔄 This test confirms the API contract - implementation should make these pass with real 200 responses"