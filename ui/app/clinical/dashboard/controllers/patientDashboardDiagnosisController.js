'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardDiagnosisController', ['$scope', 'ngDialog',
        function ($scope, ngDialog) {

            $scope.section =  $scope.dashboard.getSectionByName("diagnosis") || {};

            $scope.openSummaryDialog = function () {
                ngDialog.open({
                    template: 'dashboard/views/dashboardSections/diagnosisSummary.html',
                    className: "ngdialog-theme-default ng-dialog-all-details-page",
                    scope: $scope
                });
            };
            $scope.$on('ngDialog.closing', function (e, $dialog) {
                $("body").removeClass('ngdialog-open');
            });

        }]);