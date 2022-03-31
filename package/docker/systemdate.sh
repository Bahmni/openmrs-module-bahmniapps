# Note: This script has been copied from bahmni-playbboks/roles/bahmni-emr/files/systemdate.sh
#!/usr/bin/env bash
OUTPUT=$(date +"%D %r %Z")
OFFSET=$(date +"%z")

 echo "Content-type: application/json"
 echo ""
 echo "{\"date\": \"$OUTPUT\" , \"offset\" : \"$OFFSET\"}"
