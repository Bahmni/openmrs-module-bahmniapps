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
                $scope.visiblePatientsList= $scope.activePatientsList.slice(0,2);
        });
    }

    $scope.getActivePatientList();

        $scope.loadMore = function() {
        if($scope.visiblePatientsList !== undefined){
            var last = $scope.visiblePatientsList.length - 1;
            for(var i = 1; i <= 2; i++) {
                $scope.visiblePatientsList.push($scope.activePatientsList[i+last]);
            }
        }
    };



    $scope.matchesNameOrId = function(patient){
        if(patient !== undefined && patient.name !== undefined && patient.identifier !== undefined){
            if(patient.name.search($scope.searchParameter) >=0 || patient.identifier.search($scope.searchParameter) >= 0){
                return true;
            }
        }
        return false;
    };

    }]).directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return { 'h': w.height(), 'w': w.width() };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.style = function () {
                return {
                    'height': (newValue.h - 100) + 'px',
                    'width': (newValue.w - 100) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
})

