'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['observationFormService', 'spinner',
        function (observationFormService, spinner) {
            var loadedFormDetails = {};

            var controller = function ($scope) {
                var formUuid = $scope.form.formUuid;
                var formObservations = $scope.form.observations;

                if (!loadedFormDetails[formUuid]) {
                    spinner.forPromise(observationFormService.getFormDetail(formUuid, { v: "custom:(resources)" })
                        .then(function (response) {
                            var formDetailsAsString = _.get(response, 'data.resources[0].valueReference');
                            if (formDetailsAsString) {
                                var formDetails = JSON.parse(formDetailsAsString);
                                loadedFormDetails[formUuid] = formDetails;
                                $scope.form.component = renderWithControls(formDetails, formObservations, formUuid);
                            }
                        })
                    );
                } else {
                    $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid);
                }
            };

            return {
                restrict: 'E',
                scope: {
                    form: "="
                },
                controller: controller
            };
        }]);
