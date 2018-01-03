#!/bin/bash 

TEMP_SCRIPT_DIR=`dirname -- "$0"`
SCRIPT_DIR=`cd $TEMP_SCRIPT_DIR; pwd`
export SCRIPT_DIR

#####################################################################################################
# This script can be used to call functions which will execute a command in your vagrant box. 
# -c option will be used to pass a command
# -f option will be used to pass a full qualified file that contains commands
#####################################################################################################

MACHINE_IP=192.168.33.10
KEY_FILE=${SCRIPT_DIR}/../../bahmni-vagrant/.vagrant/machines/default/virtualbox/private_key
TIMEOUT="-o ConnectTimeout=5"

function run_in_vagrant {
    if [ "$1" == "-c" ]; then
		ssh vagrant@$MACHINE_IP -i $KEY_FILE $TIMEOUT "$2"
	elif [ "$1" == "-f" ]; then
		ssh vagrant@$MACHINE_IP -i $KEY_FILE $TIMEOUT < "$2"
	fi

}
