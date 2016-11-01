'use strict';

angular.module('bahmni.adt')
    .directive('adtPatientSearch', ['$timeout', function ($timeout) {
        var link = function ($scope, element) {
            $timeout(function () {
                element.find('.tabs ul').prepend($('.ward-list-tab'));
                element.find('.tab-content').prepend($('#ward-list'));
                if ($scope.isBedManagementEnabled && !$scope.search.navigated) {
                    $scope.search.searchType = undefined;
                }
            });
        };

        return {
            restrict: 'E',
            controller: 'PatientsListController',
            link: link,
            templateUrl: '../common/patient-search/views/patientsList.html'
        };
    }]);
