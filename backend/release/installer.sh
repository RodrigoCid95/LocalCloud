#!/bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse como root" >&2
    exit 1
fi

local service_name="local-cloud"

if systemctl list-units --type=service --all | grep -q "local-cloud"; then
    echo "LocalCloud ya está instalando."
    if [ -x ./update.sh ]; then
        ./update.sh
        exit 0
    else
        echo "El archivo update.sh no existe o no es ejecutable" >&2
        exit 1
    fi
fi

if command -v node &>/dev/null; then
    NODE_VERSION=$(node -v | grep -oP '\d+\.\d+\.\d+')
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
        echo "Actualizando Node.JS ..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        apt-get install -y nodejs
    fi
else
    echo "Instalando Nodoe.JS LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    apt-get install -y nodejs
fi

if ! dpkg -l | grep -qw samba; then
    echo "Instalando Samba ..."
    apt-get update
    apt-get install -y samba
    if [ $? -eq 0 ]; then
        echo "Samba ha sido instalado exitosamente."
    else
        echo "Hubo un problema al instalar Samba."
        exit 1
    fi
fi

initial_path=$(pwd)
cp ./local-cloud.service /etc/systemd/system
systemctl daemon-reload
cp -r ./local-cloud /etc
cd /etc/local-cloud
npm i
chmod +x run.sh
systemctl enable local-cloud.service
systemctl daemon-reload
systemctl stop local-cloud

if ! grep -q "^lc:" /etc/group; then
    groupadd lc
fi
if [ $(getent group lc | cut -d: -f4) -eq 0 ]; then
    cd "$initial_path"
    systemctl start local-cloud dev
    id=0
    while true; do
        read -p "Ingresa un nombre de usuario: " user_name
        if id "$user_name" &>/dev/null; then
            echo "El usuario $user_name ya existe. Intenta con otro nombre de usuario."
        else
            read -p "Ingresa una contraseña: " -s password
            json="{\"email\": \"\",\"full_name\": \"\",\"phone\": \"\",\"name\": \"$user_name\",\"password\": \"$password\"}"
            curl -X POST -H "Content-Type: application/json" -d "$json" -s http://localhost:3001/api/users
            id=$(id -u "$user_name")
            break
        fi
    done
    apps_directory="./apps"
    apps=()
    for file in "$apps_directory"/*; do
        if [ -f "$file" ]; then
            echo "Instalando $file ..."
            curl -X PUT -F "package_zip=@$file" -s http://localhost:3001/api/apps
            echo "¡$file instalada!"
            name_app=$(basename "${file%.*}")
            apps+=("$name_app")
        fi
    done
    for name_app in "${apps[@]}"; do
        json="{\"uid\":\"$id\", \"package_name\":\"$name_app\"}"
        curl -X POST -H "Content-Type: application/json" -d "$json" -s http://localhost:3001/api/users/assign-app
    done
    systemctl stop local-cloud
    systemctl start local-cloud dev
fi
