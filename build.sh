#!/bin/sh
# Rebuild public/ow.js from src/ (needs: npm i three esbuild)
npx esbuild src/game.js --bundle --minify --format=iife --target=es2019 --outfile=public/ow.js
