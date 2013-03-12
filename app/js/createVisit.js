'use strict';

angular.module('registration.createVisit', [])
    .controller('CreateVisitController', ['$scope', function ($scope) {
        $scope.visit = {};
        $scope.patient = {"id":"gan1234567", "names":[{"givenname":"aaa", "familyname":"bbb"}]};
        $scope.patient.fullname=$scope.patient.names[0].givenname+" "+$scope.patient.names[0].familyname;


        $scope.calculatePatientAge = function(){
            var weight = $scope.visit.weight;
            var height = $scope.visit.height;
          if(weight===null || height===null){
                            return;
          }
            var heightMtrs = height/100;
            $scope.visit.bmi = weight/(heightMtrs*heightMtrs);
        };
    }]);
