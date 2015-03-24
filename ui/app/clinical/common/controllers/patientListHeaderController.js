'use strict';

angular.module('bahmni.clinical')
    .controller('PatientListHeaderController', ['$scope',
        function ($scope) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            $scope.today = DateUtil.getDateWithoutTime(DateUtil.addDays(DateUtil.today(), 1));
            $scope.retrospectivePrivilege = Bahmni.Common.Constants.retrospectivePrivilege;
        }]);

