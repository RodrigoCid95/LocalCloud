#!/bin/bash

set -e

DEST_DIR="/usr/share/local-cloud"
NODE_BIN="$DEST_DIR/node"
NPM_BIN="$DEST_DIR/npm"
NODE_LIB="$DEST_DIR/lib"
NODE_VERSION="v22.9.0"
NODE_DIST="node-${NODE_VERSION}-linux-x64-musl"
NODE_URL="https://unofficial-builds.nodejs.org/download/release/${NODE_VERSION}/${NODE_DIST}.tar.gz"
NODE_TEMP_DIR="/tmp/node-download"
NODE_TEMP="$NODE_TEMP_DIR/${NODE_DIST}"

if [ ! -f "$NODE_BIN" ]; then
  echo "⬇️  Node.js no está instalado. Descargando desde $NODE_URL"

  mkdir -p "$NODE_TEMP_DIR"
  cd "$NODE_TEMP_DIR"

  curl -fsSL "$NODE_URL" -o node.tar.gz
  tar -xzf node.tar.gz

  echo "📁 Copiando binarios a $DEST_DIR"
  mkdir -p "$DEST_DIR"

  cp "$NODE_TEMP/bin/node" "$NODE_BIN"
  chmod +x "$NODE_BIN"
  cp -R "$NODE_TEMP/lib/node_modules/npm" "$NODE_LIB"

  echo "🔗 Creando enlaces simbólicos"
  ln -s "$NODE_LIB/bin/npm-cli.js" "$NPM_BIN"

  echo "🧹 Limpiando temporales"
  cd /
  rm -rf "$NODE_TEMP_DIR"

  echo "✅ Node.js y npm instalados en $DEST_DIR"
fi

cd "$DEST_DIR/server"
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias de npm"
  PATH="$DEST_DIR:$PATH" ./../node ./../npm install
  chmod +x ./node_modules/.bin/*
fi

echo "🚀 Iniciando el servidor de Local Cloud"
PATH="$DEST_DIR:$PATH" ROOT_MODE=true ./../node ./../npm start