'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['observationFormService', 'spinner',
        function (observationFormService, spinner) {
            var loadedFormDetails = {};

            var link = function ($scope) {
                var formUuid = $scope.form.formUuid;
                var formObservations = $scope.form.observations;
                if (!loadedFormDetails[formUuid]) {
                    spinner.forPromise(observationFormService.getFormDetail(formUuid, { v: "custom:(resources)" })
                        .then(function (response) {
                            var formDetailsAsString = _.get(response, 'data.resources[0].valueReference');
                            if (formDetailsAsString) {
                                var formDetails = JSON.parse(formDetailsAsString);
                                loadedFormDetails[formUuid] = formDetails;

                                $scope.props = { metadata: formDetails, observations: formObservations, validate: false, id: formUuid};
                            }
                        })
                    );
                } else {
                    $scope.props = { metadata: loadedFormDetails[formUuid], observations: formObservations, validate: false, id: formUuid};

                }
            };

            return {
                restrict: 'E',
                scope: {
                    form: "="
                },
                link: link,
                template: '<div ng-if="props" >'+
                            '<react-component name="container" props="{{props}}" watch-depth="reference"/>'+
                        '</div>',
            };
        }]);
