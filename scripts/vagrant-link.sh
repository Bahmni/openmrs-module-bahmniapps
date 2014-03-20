#!/bin/sh -x

PATH_OF_CURRENT_SCRIPT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $PATH_OF_CURRENT_SCRIPT/vagrant_functions.sh

if [ "$#" == "0" ]; then
	FOLDER="app"
else
	FOLDER="$1"
fi

run_in_vagrant "sudo rm -f /var/www/bahmniapps"
run_in_vagrant "sudo ln -s /Project/openmrs-module-bahmniapps/ui/$FOLDER/ /var/www/bahmniapps"
run_in_vagrant "sudo chown -h jss:jss /var/www/bahmniapps"



