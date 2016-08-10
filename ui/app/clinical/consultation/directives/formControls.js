'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['observationFormService', 'spinner',
        function (observationFormService, spinner) {
            var loadedFormDetails = {};
            var controlByType = {
                obsControl: function (control) {
                    return React.createElement(FormControls.ObsControl, { obs: control.controls });
                }
            };

            function renderControls(formUuid, formDetails) {
                var controls = _.map(formDetails.controls, function (formControl) {
                    var controlFactory = _.get(controlByType, formControl.type, undefined);
                    if (controlFactory) return controlFactory(formControl);
                });
                ReactDOM.render(React.createElement(FormControls.FormControlsContainer, { controls: controls }), document.getElementById(formUuid));
            }

            var controller = function ($scope) {
                var formUuid = $scope.formUuid;
                if (!loadedFormDetails[formUuid]) {
                    spinner.forPromise(observationFormService.getFormDetail(formUuid, { v: "custom:(resources)" })
                        .then(function (response) {
                            var formDetailsAsString = _.get(response, 'data.resources[0].valueReference');
                            if (formDetailsAsString) {
                                var formDetails = JSON.parse(formDetailsAsString);
                                loadedFormDetails[formUuid] = formDetails;
                                renderControls(formUuid, formDetails);
                            }
                        })
                    );
                }
                else {
                    renderControls(formUuid, loadedFormDetails[formUuid]);
                }
            };

            return {
                restrict: 'E',
                scope: {
                    formName: "@",
                    formUuid: "@"
                },
                controller: controller
            }
        }]);
