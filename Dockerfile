FROM alpine:latest

RUN apk update && apk add --no-cache shadow openssl samba bash ca-certificates dos2unix curl

RUN mkdir /root/local-cloud
RUN mkdir /shared
RUN mkdir -p /usr/share/local-cloud

RUN groupadd lc

RUN chown :lc /shared
RUN chmod 770 /shared

COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 445 139

CMD ["bash", "/entrypoint.sh"]