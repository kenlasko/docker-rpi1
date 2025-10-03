#!/bin/sh

echo "$(date +%F_%T) Backing up Omni etcd database..."
# ETCDCTL_API=3 etcdctl snapshot save /docker/omni-snapshot.db
echo "$(date +%F_%T) Stopping Omni container..."
docker compose --file /docker/docker-compose.yml down omni 
day=$(date +%A)
dayofmonth=$(date +%-d)
echo "$(date +%F_%T) Backing up omni.asc..."
sudo cp -f /docker/omni/omni.asc /mnt/omni-backup/
echo "$(date +%F_%T) Zipping Omni etcd database..."
sudo zip -r /mnt/omni-backup/etcdbackup-$day.zip /docker/omni
if [ "$dayofmonth" -eq 1 ]; then echo "Creating monthly backup..."; cp /mnt/omni-backup/etcdbackup-$day.zip /mnt/omni-backup/etcdbackup-monthly-$(date +%m).zip; fi
case $dayofmonth in 7|14|21|28) echo "Creating weekly backup..."; cp /mnt/omni-backup/etcdbackup-$day.zip /mnt/omni-backup/etcdbackup-weekly-$dayofmonth.zip; ;; *) ;; esac
echo "$(date +%F_%T) Starting Omni container..."
docker compose --file /docker/docker-compose.yml up -d omni 
echo "$(date +%F_%T) Omni etcd database has been backed up."
