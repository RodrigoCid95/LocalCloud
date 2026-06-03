FROM golang:1.25-trixie

WORKDIR /app

RUN apt update && apt install -y nano samba htop openssl

CMD ["/bin/bash"]