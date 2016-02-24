#!/bin/sh -x

USER=bahmni

if [ "$#" -eq "0" ]; then
	FOLDER="app"
else
	FOLDER="$1"
fi

rm -rf /var/www/bahmniapps
ln -s /bahmni-code/openmrs-module-bahmniapps/ui/"$FOLDER"/ /var/www/bahmniapps
chown -h ${USER}:${USER} /var/www/bahmniapps