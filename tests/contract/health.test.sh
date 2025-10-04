#!/bin/bash
# Contract Test: GET /health - Health Check
# File: tests/contract/health.test.sh
# Purpose: Test system health endpoint

set -e

BASE_URL="http://localhost:3000/v1"
TEST_NAME="GET /health - System Health Check"

echo "🧪 Running Contract Test: $TEST_NAME"

# Test 1: Health check endpoint
echo "📋 Test 1: Health check should return 200"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/health")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Test 1 PASSED: Health check returned 200"
  echo "   Response: $BODY"
  
  # Check for required health fields
  if echo "$BODY" | grep -q '"status"' && echo "$BODY" | grep -q '"timestamp"'; then
    echo "✅ Health response has required fields"
  else
    echo "❌ Health response missing required fields"
    exit 1
  fi
else
  echo "❌ Test 1 FAILED: Expected 200, got $HTTP_STATUS"
  echo "   Response: $BODY"
  exit 1
fi

# Test 2: Health check should include service status
echo "📋 Test 2: Health check should include service details"
if echo "$BODY" | grep -q '"database"' && echo "$BODY" | grep -q '"activepieces"'; then
  echo "✅ Test 2 PASSED: Health check includes service status"
else
  echo "❌ Test 2 FAILED: Health check missing service status"
  exit 1
fi

# Test 3: Health check response time should be reasonable
echo "📋 Test 3: Health check response time test"
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/health")
END_TIME=$(date +%s%N)
RESPONSE_TIME_MS=$(( (END_TIME - START_TIME) / 1000000 ))

if [ "$RESPONSE_TIME_MS" -lt 1000 ]; then
  echo "✅ Test 3 PASSED: Health check response time ${RESPONSE_TIME_MS}ms is acceptable"
else
  echo "❌ Test 3 FAILED: Health check response time ${RESPONSE_TIME_MS}ms is too slow"
  exit 1
fi

echo "🎉 All contract tests passed for: $TEST_NAME"