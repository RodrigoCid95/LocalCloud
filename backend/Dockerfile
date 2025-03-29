FROM ubuntu:24.04

# Instalar paquetes y limpiar caché
RUN apt update && apt upgrade -y && \
  apt install -y samba curl unzip && \
  apt clean && rm -rf /var/lib/apt/lists/*

# Instalar fnm y Node.js 18
RUN curl -fsSL https://fnm.vercel.app/install -o fnm-install.sh && \
  chmod +x fnm-install.sh && ./fnm-install.sh && \
  /root/.local/share/fnm/fnm install 18 && \
  rm fnm-install.sh

# Copiar script de ejecución y darle permisos
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir /shared
RUN mkdir /recycle-bin
RUN mkdir /var/local-cloud

# Definir punto de entrada por defecto
CMD ["/entrypoint.sh"]