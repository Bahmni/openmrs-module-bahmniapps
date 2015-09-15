'use strict';

angular.module('bahmni.clinical')
    .controller('consultationContextController', ['$scope','appService','$q',
        function ($scope, appService,$q) {

            var init = function(){
                return appService.loadConfig('dashboard.json').then(function (response) {
                    var patientConfig = response.general.sections.patientInformation;
                    if(patientConfig.hasOwnProperty("ageLimit") && $scope.patient.age >= patientConfig.ageLimit){
                        $scope.patient.ageText = $scope.patient.age.toString()+ " <span> years </span>";
                    }
                });
            };
            init();
        }]);
