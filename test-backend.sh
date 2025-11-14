#!/bin/bash

# MusicMu Backend Status Check
# Quick health and functionality test

set -e

echo "🎵 MusicMu Backend Status Check"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Service Status
echo -e "${BLUE}1. Service Status${NC}"
if systemctl is-active --quiet musicmu; then
    echo -e "   ${GREEN}✅ Service is running${NC}"
else
    echo -e "   ${RED}❌ Service is not running${NC}"
    exit 1
fi
echo ""

# Test 2: Health Endpoint
echo -e "${BLUE}2. Health Endpoint${NC}"
HEALTH=$(curl -s http://localhost:3001/health 2>&1)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "   ${GREEN}✅ Backend is healthy${NC}"
    echo "   $HEALTH" | head -1
else
    echo -e "   ${RED}❌ Health check failed${NC}"
    exit 1
fi
echo ""

# Test 3: Metadata Fetch
echo -e "${BLUE}3. Metadata Endpoint${NC}"
META=$(curl -s 'http://localhost:3001/api/track/dQw4w9WgXcQ' 2>&1)
if echo "$META" | grep -q "videoId"; then
    TITLE=$(echo "$META" | grep -o '"title":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "   ${GREEN}✅ Metadata working${NC}"
    echo "   Title: $TITLE"
else
    echo -e "   ${RED}❌ Metadata fetch failed${NC}"
fi
echo ""

# Test 4: Stream Endpoint
echo -e "${BLUE}4. Stream Endpoint${NC}"
STREAM=$(curl -s 'http://localhost:3001/api/track/dQw4w9WgXcQ/stream' 2>&1)

if echo "$STREAM" | grep -q "mode.*iframe"; then
    echo -e "   ${YELLOW}⚠️  Using iframe fallback${NC}"
    echo "   (Piped API might be rate-limited or down)"
    echo "   Fallback mode is working correctly ✅"
elif file -b - <<< "$STREAM" | grep -q "audio"; then
    echo -e "   ${GREEN}✅ Direct streaming via Piped${NC}"
    echo "   Piped API is working!"
else
    echo -e "   ${RED}❌ Stream endpoint error${NC}"
fi
echo ""

# Test 5: Search Endpoint
echo -e "${BLUE}5. Search Endpoint${NC}"
SEARCH=$(curl -s 'http://localhost:3001/api/search?q=test' 2>&1)
if echo "$SEARCH" | grep -q "videoId"; then
    COUNT=$(echo "$SEARCH" | grep -o "videoId" | wc -l)
    echo -e "   ${GREEN}✅ Search working${NC}"
    echo "   Found $COUNT results"
else
    echo -e "   ${YELLOW}⚠️  Search returned no results${NC}"
fi
echo ""

# Test 6: Check Dependencies
echo -e "${BLUE}6. Dependencies Check${NC}"
cd "$(dirname "$0")/server"

if [ -f "package.json" ]; then
    if grep -q "@distube/ytdl-core" package.json; then
        echo -e "   ${YELLOW}⚠️  Old dependency: @distube/ytdl-core (should be removed)${NC}"
    fi
    if grep -q "play-dl" package.json; then
        echo -e "   ${YELLOW}⚠️  Old dependency: play-dl (should be removed)${NC}"
    fi
    if ! grep -q "@distube/ytdl-core\|play-dl" package.json; then
        echo -e "   ${GREEN}✅ No old dependencies found${NC}"
    fi
fi
echo ""

# Test 7: Piped Instance Check
echo -e "${BLUE}7. Piped Instance Status${NC}"
PIPED_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://piped.in.projectsegfau.lt 2>&1 || echo "000")

if [ "$PIPED_CHECK" = "200" ] || [ "$PIPED_CHECK" = "301" ] || [ "$PIPED_CHECK" = "302" ]; then
    echo -e "   ${GREEN}✅ Piped instance is reachable${NC}"
    echo "   https://piped.in.projectsegfau.lt (HTTP $PIPED_CHECK)"
else
    echo -e "   ${YELLOW}⚠️  Piped instance unreachable${NC}"
    echo "   (Iframe fallback will be used)"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ Status Check Complete${NC}"
echo ""
echo "Backend is running at: http://localhost:3001"
echo "Frontend is running at: http://musicmu.local:5173"
echo ""
echo "Architecture:"
echo "  STEP 1: Piped API → Proxy Stream"
echo "  STEP 2: IFrame Fallback (if Piped fails)"
echo ""

cd - > /dev/null
