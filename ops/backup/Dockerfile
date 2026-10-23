FROM postgres:17
RUN apt-get update && apt-get install -y --no-install-recommends age util-linux && rm -rf /var/lib/apt/lists/*
COPY backup.sh restore-test.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/backup.sh /usr/local/bin/restore-test.sh
ENV BACKUP_DIR=/backups BACKUP_RETENTION_DAYS=14 BACKUP_INTERVAL_SECONDS=86400
ENTRYPOINT ["/usr/local/bin/backup.sh"]
CMD ["loop"]
