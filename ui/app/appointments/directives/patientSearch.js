'use strict';

angular.module('bahmni.appointments')
    .directive('patientSearch', ['patientService', 'appointmentsService', 'spinner', '$state', function (patientService, appointmentsService, spinner, $state) {
        return {
            restrict: "E",
            scope: {
                onSearch: "="
            },
            templateUrl: "../appointments/views/manage/patientSearch.html",
            link: {
                pre: function ($scope) {
                    $scope.search = function () {
                        return spinner.forPromise(patientService.search($scope.patient).then(function (response) {
                            return response.data.pageOfResults;
                        }));
                    };

                    $scope.responseMap = function (data) {
                        return _.map(data, function (patientInfo) {
                            var familyName = patientInfo.familyName ? " " + patientInfo.familyName : '';
                            patientInfo.label = patientInfo.givenName + familyName + " " + "(" + patientInfo.identifier + ")";
                            return patientInfo;
                        });
                    };

                    $scope.onSelectPatient = function (data) {
                        $state.params.patient = data;
                        spinner.forPromise(appointmentsService.search({patientUuid: data.uuid}).then(function (oldAppointments) {
                            var appointmentInDESCOrderBasedOnStartDateTime = _.sortBy(oldAppointments.data, "startDateTime").reverse();
                            $scope.onSearch(appointmentInDESCOrderBasedOnStartDateTime);
                        }));
                    };

                    if ($state.params.isSearchEnabled && $state.params.patient) {
                        $scope.patient = $scope.responseMap([$state.params.patient])[0].label;
                        $scope.onSelectPatient($state.params.patient);
                    }

                    $scope.$watch(function () {
                        return $state.params.isSearchEnabled;
                    }, function (isSearchEnabled) {
                        if (isSearchEnabled == false) {
                            $scope.patient = null;
                        }
                    }, true);
                }
            }
        };
    }]);
