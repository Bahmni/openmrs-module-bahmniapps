'use strict';

angular.module('bahmni.clinical')
    .directive('managePrograms', function(){
        return {
            restict: 'EA',
            templateUrl: "consultationcontext/views/programEnrollment.html",
            controller: 'ManageProgramController',
            scope:{
                patient: "="
            }
        }

    });
