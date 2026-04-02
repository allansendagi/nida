#!/bin/bash
TOKEN=$(grep WHATSAPP_ACCESS_TOKEN .env.local | cut -d= -f2-)
PHONE_ID="${1}"  # Pass phone ID as argument, e.g: bash register_step2.sh 1234567890
PIN="873412"

if [ -z "$PHONE_ID" ]; then
  echo "Usage: bash register_step2.sh <PHONE_ID>"
  exit 1
fi

echo "=== Step 2: Set PIN on phone number ==="
curl -X POST "https://graph.facebook.com/v24.0/$PHONE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"pin\": \"$PIN\"}"
echo ""

echo "=== Step 3: Register number for webhooks ==="
curl -X POST "https://graph.facebook.com/v24.0/$PHONE_ID/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"messaging_product\": \"whatsapp\", \"pin\": \"$PIN\"}"
echo ""
