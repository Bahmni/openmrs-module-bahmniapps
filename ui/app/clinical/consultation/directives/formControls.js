'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['observationFormService', 'spinner', '$timeout',
        function (observationFormService, spinner, $timeout) {
            var loadedFormDetails = {};

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
                        })
                    );
                } else {
                    $timeout(function () {
                        $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid, collapse);
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
                        _.remove($scope.$parent.consultation.observations, function (observation) {
                            return _.get(observation, 'formNamespace') === $scope.form.formName;
                        });
                        if ($scope.form.component) {
                            var formObservations = $scope.form.component.getValue();
                            _.each(formObservations.observations, function (obs) {
                                $scope.$parent.consultation.observations.push(obs);
                            });
                            $scope.form.observations = formObservations.observations;
                        }
                    }
                    unMountForm(document.getElementById($scope.form.formUuid));
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
