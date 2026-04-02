#!/bin/bash
TOKEN=$(grep WHATSAPP_ACCESS_TOKEN .env.local | cut -d= -f2-)
WABA_ID="1522912069253290"
PIN="873412"

echo "=== Step 1: Get real Phone ID from WABA ==="
curl -s -X GET "https://graph.facebook.com/v24.0/$WABA_ID/phone_numbers?access_token=$TOKEN" | tee /tmp/phone_ids.json
echo ""

echo ">>> Copy the 'id' value from above, then set PHONE_ID below and run steps 2 & 3"
echo "    Or if only one number appears, run register_step2.sh"
