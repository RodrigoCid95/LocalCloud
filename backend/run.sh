#!/bin/bash

if [ $# -gt 0 ]; then
  user_name="$1"
  /usr/bin/node /home/dev/release/server/main.js -- --type http --user "$user_name"
else
  /usr/bin/node /home/dev/release/server/main.js -- --type http
fi
