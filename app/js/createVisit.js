'use strict';

angular.module('registration.createVisit', ['resources.patientData'])
    .controller('CreateVisitController', ['$scope','$location', 'patientData', function ($scope ,$location, patientData) {
        (function(){
            $scope.visit = {};
            $scope.patient = patientData.response();
        })();


        $scope.calculatePatientAge = function(){
            var weight = $scope.visit.weight;
            var height = $scope.visit.height;
          if(weight===null || height===null){
                            return;
          }
            var heightMtrs = height/100;
            $scope.visit.bmi = weight/(heightMtrs*heightMtrs);
        };

        $scope.back = function(){
            $location.path("/create");
        }
    }]);
