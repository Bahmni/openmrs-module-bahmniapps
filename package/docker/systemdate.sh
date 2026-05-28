# This Source Code Form is subject to the terms of the Mozilla Public License,
# v. 2.0. If a copy of the MPL was not distributed with this file, You can
# obtain one at https://www.bahmni.org/license/mplv2hd.
#
# Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
# graphic logo is a trademark of OpenMRS Inc.


# Note: This script has been copied from bahmni-playbboks/roles/bahmni-emr/files/systemdate.sh
#!/usr/bin/env bash
OUTPUT=$(date +"%D %r %Z")
OFFSET=$(date +"%z")

 echo "Content-type: application/json"
 echo ""
 echo "{\"date\": \"$OUTPUT\" , \"offset\" : \"$OFFSET\"}"
