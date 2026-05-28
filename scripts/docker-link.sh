# This Source Code Form is subject to the terms of the Mozilla Public License,
# v. 2.0. If a copy of the MPL was not distributed with this file, You can
# obtain one at https://www.bahmni.org/license/mplv2hd.
#
# Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
# graphic logo is a trademark of OpenMRS Inc.


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