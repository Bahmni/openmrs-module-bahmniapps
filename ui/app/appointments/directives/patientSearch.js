'use strict';

angular.module('bahmni.appointments')
    .directive('patientSearch', ['patientService', 'appointmentsService', 'spinner', function (patientService, appointmentsService, spinner) {
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
                            patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                            return patientInfo;
                        });
                    };

                    $scope.onSelectPatient = function (data) {
                        $scope.patientUuid = data.uuid;
                        spinner.forPromise(appointmentsService.search({patientUuid: data.uuid}).then(function (oldAppointments) {
                            $scope.onSearch(oldAppointments.data);
                        }));
                    };
                }
            }
        };
    }]);
