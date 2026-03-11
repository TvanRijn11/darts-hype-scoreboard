#!/bin/bash

# 1. Stop and remove existing processes to avoid duplicates
pm2 delete ws-server ngrok-tunnel 2>/dev/null

# 2. Start the WebSocket Server
# We use -- to tell PM2 that everything after is an argument for npm
pm2 start npm --name "ws-server" -- run ws-server

# 3. Start the Ngrok tunnel
# Replace YOUR_STATIC_DOMAIN.ngrok-app.com with your actual Ngrok domain
# Syntax: pm2 start <binary> --name <name> -- <arguments>
pm2 start ngrok --name "ngrok-tunnel" -- http  4000

# 4. Save the list so they start automatically if the computer reboots
pm2 save

echo "------------------------------------------------"
echo "Darts Server and Tunnel are running in background!"
echo "Check status: pm2 list"
echo "Check logs:   pm2 logs ngrok-tunnel"
echo "------------------------------------------------"