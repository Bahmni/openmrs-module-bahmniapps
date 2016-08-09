'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['observationFormService', 'contextChangeHandler', 'appService', 'observationsService', 'messagingService', 'conceptSetService', 'conceptSetUiConfigService', 'spinner',
        function (observationFormService, contextChangeHandler, appService, observationsService, messagingService, conceptSetService, conceptSetUiConfigService, spinner) {
            var isLoaded = {};
            var controlByType = {
                obsControl: function (control) {
                    return React.createElement(FormControls.ObsControl, { obs: control.controls });
                }
            };

            var controller = function ($scope) {
                var formName = $scope.formName;
                if (!isLoaded[formName]) {
                    spinner.forPromise(observationFormService.getFormDetail($scope.formUuid, { v: "custom:(resources)" })
                        .then(function (response) {
                            var formDetails = _.get(response, 'data.resources[0].valueReference');
                            if (formDetails) {
                                var controls = createControls(formDetails);
                                ReactDOM.render(React.createElement(FormControls.FormControlsContainer, { controls: controls }), document.getElementById($scope.formUuid));
                            }
                            isLoaded[formName] = true;
                        })
                    );
                }
            };

            function createControls(formDetails) {
                var formControls = JSON.parse(formDetails).controls;
                var controlElements = _.map(formControls, function (formControl) {
                    var controlFactory = _.get(controlByType, formControl.type, undefined);
                    if (controlFactory) return controlFactory(formControl);
                });
                return controlElements
            }

            return {
                restrict: 'E',
                scope: {
                    formName: "=",
                    formUuid: "="
                },
                controller: controller
            }
        }]);
