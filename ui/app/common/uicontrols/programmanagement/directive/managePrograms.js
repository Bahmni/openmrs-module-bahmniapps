'use strict';

angular.module('bahmni.clinical')
    .directive('managePrograms', function(){
        return {
            templateUrl: "../common/uicontrols/programmanagement/views/programEnrollment.html",
            controller: 'ManageProgramController',
            scope:{
                patient: "="
            }
        }

    });
