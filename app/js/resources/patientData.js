'use strict';

angular.module('resources.patientData', [])
	.factory('patientData', function () {
		
        var patientObj, patientResponse;
    
        var rememberResponse = function (response) {
            patientResponse = response;
        }

        var response = function () {
            return patientResponse;
        }

        var patientObject = function () {
            if(patientObj == null){
                return {
                        names: [{}],
                        addresses: [{}],
                        attributes: []
                    };
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
    });
