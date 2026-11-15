FROM alpine:3.22

RUN apk add --no-cache mongodb-tools supercronic

COPY backup.sh /backup.sh

# Every day at 03:00 UTC. Unlike crond, supercronic passes the container's environment to the job and logs its output
RUN echo '0 3 * * * /backup.sh daily' > /etc/crontab

# Absolute path: as PID 1, supercronic re-executes itself to reap zombie processes, and fails to find a bare name
CMD ["/usr/bin/supercronic", "/etc/crontab"]
