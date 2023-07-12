#!/usr/bin/env bash

# Assumes the following are installed:
#  - libsqlite3-dev
#  - node v14.17.0
#  - npm 6.14.13

echo "[DEBUG] In setup.sh"

# exit on error
set -e

# Get the directory of the script
script_dir="$(cd "$(dirname "$0")"; pwd)"

echo "[DEBUG] Checking versions..."
echo "npm version: `npm --version`"
echo "node version: `node --version`"

echo "[DEBUG] FRONTEND SETUP"
cd "${script_dir}/frontend" && npm install && CI=false npm run build

echo "[DEBUG] API SETUP"
cd "${script_dir}/api" && npm install && npm i -g ts-node

