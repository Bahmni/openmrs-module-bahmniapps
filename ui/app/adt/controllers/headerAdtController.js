'use strict';

angular.module('bahmni.adt')
    .controller('HeaderAdtController', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $scope.retrospectivePrivilege = Bahmni.Common.Constants.retrospectivePrivilege;
    }]);
