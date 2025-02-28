#!/bin/sh

ETCDCTL_API=3 etcdctl snapshot save /docker/omni/snapshot.db
day=$(date +%A)
dayofmonth=$(date +%-d)
echo "$(date +%F_%T) Backing up Omni etcd database..."
sudo zip -r /mnt/omni-backup/etcdbackup-$day.zip /docker/omni/
if [ "$dayofmonth" -eq 1 ]; then echo "Creating monthly backup..."; cp /mnt/omni-backup/etcdbackup-$day.zip /mnt/omni-backup/etcdbackup-monthly-$(date +%m).zip; fi
case $dayofmonth in 7|14|21|28) echo "Creating weekly backup..."; cp /mnt/omni-backup/etcdbackup-$day.zip /mnt/omni-backup/etcdbackup-weekly-$dayofmonth.zip; ;; *) ;; esac
echo "$(date +%F_%T) Omni etcd database has been backed up."
