#!/bin/sh -x
PATH_OF_CURRENT_SCRIPT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $PATH_OF_CURRENT_SCRIPT/vagrant_functions.sh

#invoke migration of openmrs core
run_in_vagrant -c "sudo su - bahmni -c 'cd /bahmni_temp/ && ./run-liquibase-openmrs.sh'"
#invoke migrations of bahmni core omods
run_in_vagrant -c "sudo su - bahmni -c 'cd /bahmni_temp/ && ./run-modules-liquibase.sh'"
