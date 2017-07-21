'use strict';

angular.module('bahmni.appointments')
    .controller('deleteAppointmentServiceController', ['$scope', function ($scope) {
        $scope.service = $scope.ngDialogData.service;

    }]);
