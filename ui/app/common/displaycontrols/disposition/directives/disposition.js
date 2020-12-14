"use strict";

angular.module('bahmni.common.displaycontrol.disposition')
    .directive('disposition', ['dispositionService', 'spinner',
        function (dispositionService, spinner) {
            var controller = function ($scope) {
                var fetchDispositionByPatient = function (patientUuid, numOfVisits) {
                    return dispositionService.getDispositionByPatient(patientUuid, numOfVisits)
                        .then(handleDispositionResponse);
                };

                var handleDispositionResponse = function (response) {
                    $scope.dispositions = response.data;

                    if (_.isEmpty($scope.dispositions)) {
                        $scope.noDispositionsMessage = Bahmni.Common.Constants.messageForNoDisposition;
                        $scope.$emit("no-data-present-event");
                    }
                };

                var fetchDispositionsByVisit = function (visitUuid) {
                    return dispositionService.getDispositionByVisit(visitUuid).then(handleDispositionResponse);
                };

                $scope.getNotes = function (disposition) {
                    if (disposition.additionalObs[0] && disposition.additionalObs[0].value) {
                        return disposition.additionalObs[0].value;
                    }
                    return "";
                };
                $scope.getDisplayName = function (disposition) {
                    if (disposition.preferredName != null) {
                        return disposition.preferredName;
                    } else {
                        return disposition.conceptName;
                    }
                };

                $scope.showDetailsButton = function (disposition) {
                    if ($scope.getNotes(disposition)) {
                        return false;
                    }
                    return $scope.params.showDetailsButton;
                };

                $scope.toggle = function (element) {
                    if ($scope.showDetailsButton(element)) {
                        element.show = !element.show;
                    } else {
                        element.show = true;
                    }
                    return false;
                };

                if ($scope.visitUuid) {
                    $scope.fetchDispositionPromise = fetchDispositionsByVisit($scope.visitUuid);
                } else if ($scope.params.numberOfVisits && $scope.patientUuid) {
                    $scope.fetchDispositionPromise = fetchDispositionByPatient($scope.patientUuid, $scope.params.numberOfVisits);
                }
            };

            var link = function (scope, element) {
                spinner.forPromise(scope.fetchDispositionPromise, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: "../common/displaycontrols/disposition/views/disposition.html",
                scope: {
                    params: "=",
                    patientUuid: "=?",
                    visitUuid: "=?"
                }
            };
        }]);
