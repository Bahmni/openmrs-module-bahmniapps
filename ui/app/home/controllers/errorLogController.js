'use strict';

angular.module('bahmni.home')
    .controller('ErrorLogController', ['$q', 'spinner', '$scope',
        function ($q, spinner, $scope) {
            $scope.errorLogs = [];
            $scope.showErrorLog = true;
        }]);

