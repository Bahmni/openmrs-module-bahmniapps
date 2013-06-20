'use strict';

angular.module('opd.activePatientsListController', ['opd.patientsListService', 'opd.patientService','infinite-scroll'])
    .controller('ActivePatientsListController', ['$route', '$scope', '$location', 'PatientsListService', 'PatientService', function ($route, $scope, $location, patientsListService, patientService) {
        $scope.getActivePatientList = function () {
        var queryParameters = $location.search();

        patientsListService.getActivePatients(queryParameters).success(function (data) {
            data.forEach(function (datum) {
                datum.image = patientService.constructImageUrl(datum.identifier);
            });
            $scope.activePatientsList = data;
            $scope.visiblePatientsList= $scope.activePatientsList.slice(0,30);
        });
    }



    $scope.loadMore = function() {
        if($scope.visiblePatientsList !== undefined){
            var last = $scope.visiblePatientsList.length - 1;
            for(var i = 1; i <=8; i++) {
                $scope.visiblePatientsList.push($scope.activePatientsList[i+last]);
            }
        }
    };

    $scope.getActivePatientList();

    $scope.matchesNameOrId = function(patient){
        if(patient !== undefined && patient.name !== undefined && patient.identifier !== undefined ){
            if($scope.searchParameter === undefined){
                return true;
            }
            if(patient.name.toLowerCase().search($scope.searchParameter.toLowerCase()) >=0
                || patient.identifier.toLowerCase().search($scope.searchParameter.toLowerCase()) >= 0){
                return true;
            }

        }
        return false;
    };



    }])/*.directive('resize', function ($window) {
        return function (scope,element) {
            scope.width =  element.get(0).offsetWidth;
            scope.height = $window.innerHeight;

            scope.tileContainer = element.get(0);

            angular.element($window).bind('resize', function () {
                scope.$apply(function () {
                    scope.width = $window.innerWidth;
                    scope.height = $window.innerHeight;
                });
            });
        };
    })

    /*.directive('recordSize', function ($window) {
        return function (scope,element,attrs) {

            var recordSizeConfig = attrs.recordSize;
            if(scope.recordSize == undefined){
            scope.recordSize = {width : element.get(0).offsetWidth, height : element.get(0).offsetHeight};

            scope.loadMore();
        }
        };
    });*/

