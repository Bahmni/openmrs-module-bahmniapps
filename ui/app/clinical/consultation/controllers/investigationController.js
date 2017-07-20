'use strict';

angular.module('bahmni.clinical')
.controller('InvestigationController', ['$scope', 'labTestsProvider', 'otherTestsProvider',
    function ($scope, labTestsProvider, otherTestsProvider) {
        $scope.tabs = [
        {name: 'Laboratory', testsProvider: labTestsProvider, filterColumn: "sample", filterHeader: "Sample", categoryColumn: "department"},
        {name: 'Other', testsProvider: otherTestsProvider, filterColumn: "type", filterHeader: "Investigation", categoryColumn: "category"}
        ];

        $scope.activateTab = function (tab) {
            if ($scope.activeTab) {
                ($scope.activeTab.klass = "");
            }
            $scope.activeTab = tab;
            $scope.activeTab.klass = "active";
        };

        var findVoidedInvestigations = function () {
            var filteredInvestigation = $scope.consultation.investigations.filter(function (investigation) {
                return investigation.voided;
            });
            return filteredInvestigation.length === $scope.consultation.investigations.length;
        };
        $scope.isValidInvestigation = function () {
            if (!$scope.consultation.investigations.length > 0 || findVoidedInvestigations()) {
                $scope.noteState = false;
                if ($scope.consultation.labOrderNote.uuid) {
                    $scope.consultation.labOrderNote.voided = true;
                } else {
                    if ($scope.consultation.labOrderNote.value) {
                        $scope.consultation.labOrderNote.value = null;
                    }
                }
                return false;
            } else {
                if ($scope.consultation.labOrderNote.uuid) {
                    $scope.noteState = true;
                    $scope.consultation.labOrderNote.voided = false;
                }
                return true;
            }
        };

        $scope.activateTab($scope.tabs[0]);

        $scope.toggleNote = function () {
            $scope.noteState = $scope.noteState ? false : true;
        };

        var init = function () {
            $scope.noteState = $scope.consultation.labOrderNote && $scope.consultation.labOrderNote.value ? true : false;
        };

        $scope.onNoteChanged = function () {
            if ($scope.consultation.labOrderNote) {
//        TODO: Mihir, D3 : Hacky fix to update the datetime to current datetime on the server side. Ideal would be void the previous observation and create a new one.
                $scope.consultation.labOrderNote.observationDateTime = null;
            }
        };

        init();
    }]);
