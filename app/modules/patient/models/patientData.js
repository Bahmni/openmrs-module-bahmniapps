'use strict';

angular.module('resources.patientData', ['resources.patient'])
	.factory('patientData',['patient', function (patientModule) {
		
        var patientObj, patientResponse;
    
        var rememberResponse = function (response) {
            patientResponse = response;
        }

        var response = function () {
            return patientResponse;
        }

        var patientObject = function () {
            if(patientObj == null){
                return patientModule.create();
            }
            return patientObj;
        }

		var rememberPatient = function (patient) {
            patientObj = patient;
        }



        return {
            rememberResponse: rememberResponse,
            response: response,
            patientObject: patientObject,
            rememberPatient: rememberPatient
        };
    }]);
