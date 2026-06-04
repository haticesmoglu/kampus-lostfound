#!/bin/bash
echo "===================================================="
echo "  KAMPUS KAYIP & BULUNAN ESYA PORTALI ATESLENIYOR   "
echo "===================================================="

# 1. Klasor konumunu garantiye alıp backend'i arka planda atesler
cd "$(dirname "$0")/backend"
echo "[1/2] Node.js Express Backend sunucusu baslatiliyor..."
npm install && npm start &

# 2. Ana dizine geri donup frontend'i baslatır
cd ../frontend
echo "[2/2] React Frontend uygulamasi derleniyor..."
npm install && npm start