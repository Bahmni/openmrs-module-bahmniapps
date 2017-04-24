'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['observationFormService', 'spinner', '$timeout',
        function (observationFormService, spinner, $timeout) {
            var loadedFormDetails = {};
            var unMountReactContainer = function (formUuid) {
                var reactContainerElement = angular.element(document.getElementById(formUuid));
                reactContainerElement.on('$destroy', function () {
                    unMountForm(document.getElementById(formUuid));
                });
            };

            var controller = function ($scope) {
                var formUuid = $scope.form.formUuid;
                var formObservations = $scope.form.observations;
                var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;

                if (!loadedFormDetails[formUuid]) {
                    spinner.forPromise(observationFormService.getFormDetail(formUuid, { v: "custom:(resources:(value))" })
                        .then(function (response) {
                            var formDetailsAsString = _.get(response, 'data.resources[0].value');
                            if (formDetailsAsString) {
                                var formDetails = JSON.parse(formDetailsAsString);
                                formDetails.version = $scope.form.formVersion;
                                loadedFormDetails[formUuid] = formDetails;
                                $scope.form.component = renderWithControls(formDetails, formObservations, formUuid, collapse);
                            }
                            unMountReactContainer($scope.form.formUuid);
                        })
                    );
                } else {
                    $timeout(function () {
                        $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid, collapse);
                        unMountReactContainer($scope.form.formUuid);
                    }, 0, false);
                }

                $scope.$watch('form.collapseInnerSections', function () {
                    var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                    if (loadedFormDetails[formUuid]) {
                        $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid, collapse);
                    }
                });

                $scope.$on('$destroy', function () {
                    if ($scope.$parent.consultation.observationForms) {
                        if ($scope.form.component) {
                            var formObservations = $scope.form.component.getValue();
                            $scope.form.observations = formObservations.observations;

                            var hasError = formObservations.errors;
                            if (!_.isEmpty(hasError)) {
                                $scope.form.isValid = false;
                            }
                        }
                    }
                });
            };

            return {
                restrict: 'E',
                scope: {
                    form: "="
                },
                controller: controller
            };
        }]);
