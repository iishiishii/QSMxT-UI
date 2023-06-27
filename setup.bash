#!/bin/bash

# exit on error
set -e

# Assumes the following are installed:
#  - libsqlite3-dev
#  - node v14.17.0
#  - npm 6.14.13

echo "[DEBUG] In setup.bash"

echo "[DEBUG] Checking versions..."
echo "npm version: `npm --version`"
echo "node version: `node --version`"

echo "[DEBUG] FRONTEND SETUP"
cd frontend

echo "[DEBUG] Running 'npm install' in `pwd`:"
npm install

#echo "[DEBUG] Removing package-lock.json:"
#rm package-lock.json

echo "[DEBUG] Running 'npm build' in `pwd`:"
CI=false npm run build

echo "[DEBUG] API SETUP"
cd ../api

#echo "[DEBUG] Updating package lists via apt-get update..."
#apt-get update

#echo "[DEBUG] Installing libsqlite3-dev"
#apt-get install libsqlite3-dev

#echo "[DEBUG] Installing sqlite3 via npm 'npm install sqlite3 --build-from-source'"
#npm install sqlite3 --build-from-source

echo "[DEBUG] Installing API via 'npm install'"
npm install

echo "[DEBUG] Final step via 'npm i -g ts-node'"
npm i -g ts-node

