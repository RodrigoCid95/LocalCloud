#!/bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse como root" >&2
    exit 1
fi

systemctl stop local-cloud
rm -R /etc/local-cloud
cp -R ./local-cloud /etc
cd /etc/local-cloud
npm i
chmod +x run.sh
systemctl start local-cloud
