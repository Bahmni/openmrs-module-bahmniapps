#!/bin/sh -x -e

PATH_OF_CURRENT_SCRIPT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $PATH_OF_CURRENT_SCRIPT/vagrant_functions.sh
#USER=jss
USER=bahmni

if [ "$#" == "0" ]; then
	FOLDER="app"
else
	FOLDER="$1"
fi

run_in_vagrant -c "sudo rm -rf /var/www/bahmniapps"
run_in_vagrant -c "sudo ln -s /bahmni/openmrs-module-bahmniapps/ui/$FOLDER/ /var/www/bahmniapps"
run_in_vagrant -c "sudo chown -h ${USER}:${USER} /var/www/bahmniapps"

run_in_vagrant -c "sudo rm -rf /var/www/style-guide"
run_in_vagrant -c "sudo ln -s /bahmni/openmrs-module-bahmniapps/ui/style-guide/ /var/www/style-guide"
run_in_vagrant -c "sudo chown -h ${USER}:${USER} /var/www/style-guide"