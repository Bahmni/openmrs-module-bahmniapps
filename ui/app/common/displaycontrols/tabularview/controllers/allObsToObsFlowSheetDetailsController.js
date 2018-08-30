'use strict';
angular.module('bahmni.common.displaycontrol.observation')
    .controller('AllObsToObsFlowSheetDetailsController', ['$scope', 'appService',
        function ($scope, appService) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.section = $scope.ngDialogData.section;
            $scope.config = $scope.ngDialogData.section ? $scope.ngDialogData.section.expandedViewConfig : {};
            $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue('displayNepaliDates');
        }]);
