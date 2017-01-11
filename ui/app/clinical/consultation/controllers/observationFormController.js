'use strict';

angular.module('bahmni.clinical')
    .controller('ObservationFormController', ['$scope', '$rootScope', 'observationFormService', 'spinner',
        function ($scope, $rootScope, observationFormService, spinner) {
            var init = function () {
                if (!($scope.consultation.observationForms !== undefined && $scope.consultation.observationForms.length > 0)) {
                    spinner.forPromise(observationFormService.getFormList($scope.consultation.encounterUuid)
                        .then(function (response) {
                            $scope.consultation.observationForms = getObservationForms(response.data);
                        })
                    );
                }
            };

            var getObservationForms = function (observationsForms) {
                var forms = [];
                var observations = $scope.consultation.observations || [];
                _.each(observationsForms, function (observationForm) {
                    var formUuid = observationForm.formUuid || observationForm.uuid;
                    var formName = observationForm.name || observationForm.formName;
                    var formVersion = observationForm.version || observationForm.formVersion;
                    forms.push(new Bahmni.ObservationForm(formUuid, $rootScope.currentUser, formName, formVersion, observations));
                });
                return forms;
            };

            $scope.toggle = function (item) {
                item.show = !item.show;
            };

            init();
        }]);
