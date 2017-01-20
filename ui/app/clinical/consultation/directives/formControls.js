'use strict';

function stateToObservationsMap(state) {
    return {
        observations: state.observations
    }
}

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['observationFormService', 'spinner', '$timeout', '$ngRedux', 'reduxService',
        function (observationFormService, spinner, $timeout, $ngRedux, reduxService) {
            var loadedFormDetails = {};
            var controller = function ($scope) {
            var self = this;
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
                                self.dispatch({type:'RANDOM', data: '123'});

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
                        $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid, collapse, myListener);
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

            var myListner = function (state) {
                $scope.skdjf=  sldfkj;
            };
            reduxService.register(stateToObservationsMap, myListner);

            return {
                restrict: 'E',
                scope: {
                    form: "="
                },
                controller: controller
            };
        }]);
