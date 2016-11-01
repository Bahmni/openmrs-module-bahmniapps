'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .directive('managePrograms', function () {
        return {
            templateUrl: "../common/uicontrols/programmanagement/views/programEnrollment.html",
            controller: 'ManageProgramController',
            scope: {
                patient: "="
            }
        };
    });
