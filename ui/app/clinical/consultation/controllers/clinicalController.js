'use strict';

angular.module('bahmni.clinical').controller('ClinicalController',
    ['$scope', 'retrospectiveEntryService',
        function ($scope, retrospectiveEntryService) {

            $scope.retrospectiveClass = function () {
                if (retrospectiveEntryService.getRetrospectiveEntry() && retrospectiveEntryService.getRetrospectiveEntry().encounterDate &&
                    retrospectiveEntryService.getRetrospectiveEntry().encounterDate < Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now())) {
                    return "retro-mode";
                }
            }

        }]);
