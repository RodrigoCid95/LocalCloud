#!/bin/bash

export PATH="/root/.local/share/fnm:/root/.local/share/fnm/aliases/default/bin:$PATH"
cd /root/local-cloud
if [ ! -d "node_modules" ]; then
  npm i -g npm
  npm install
fi
npm start