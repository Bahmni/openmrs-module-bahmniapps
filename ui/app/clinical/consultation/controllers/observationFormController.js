'use strict';

angular.module('bahmni.clinical')
    .controller('ObservationFormController', ['$scope', 'observationFormService', 'spinner',
        function ($scope, observationFormService, spinner) {
            var init = function () {
                if (!($scope.consultation.observationForms !== undefined && $scope.consultation.observationForms.length > 0)) {
                    spinner.forPromise(observationFormService.getFormList($scope.consultation.encounterUuid)
                        .then(function (response) {
                            $scope.consultation.observationForms = getObservationForms(response.data);
                        }));
                } else {
                    $scope.consultation.observationForms = getObservationForms($scope.consultation.observationForms);
                }
            };

            var getObservationForms = function (observationsForms) {
                var forms = [];
                var observations = $scope.consultation.observations || [];
                _.each(observationsForms, function (observationForm) {
                    var formUuid = observationForm.formUuid || observationForm.uuid;
                    var formName = observationForm.name || observationForm.formName;
                    var formVersion = observationForm.version || observationForm.formVersion;
                    forms.push(new Bahmni.ObservationForm(formUuid, formName, formVersion, observations));
                });
                return forms;
            };

            $scope.$on('$stateChangeStart', function () {
                if ($scope.consultation.observationForms) {
                    _.remove($scope.consultation.observations, function (observation) {
                        return observation.formNamespace;
                    });
                    _.each($scope.consultation.observationForms, function (observationForm) {
                        if (observationForm.component) {
                            var formObservations = observationForm.component.getValue();
                            _.each(formObservations.observations, function (obs) {
                                $scope.consultation.observations.push(obs);
                            });
                        }
                    });
                }
            });

            $scope.toggle = function (item) {
                item.show = !item.show;
            };

            init();
        }]);
