'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['formService', 'spinner', '$timeout', '$translate',
        function (formService, spinner, $timeout, $translate) {
            var loadedFormDetails = {};
            var loadedFormTranslations = {};

            function createEyeDiagram (eyeSide, inputs) {
                var diagram = document.createElement('div');
                diagram.className = 'eye-diagram ' + eyeSide + '-eye';

                var centerX = 150, centerY = 150, radius = 100;
                var adjustmentRatio = 1.033;
                var verticalShift = -20;

                var positions = [
                    { angle: 0, label: "Right" },
                    { angle: 60, label: "Bottom Right" },
                    { angle: 120, label: "Bottom Left" },
                    { angle: 180, label: "Left" },
                    { angle: 240, label: "Top Left" },
                    { angle: 300, label: "Top Right" }
                ];

                positions.forEach(function (pos) {
                    var line = document.createElement('div');
                    line.className = 'diagram-line';
                    line.style.width = radius + 'px';
                    line.style.transform = 'rotate(' + pos.angle + 'deg)';
                    line.style.left = centerX + 'px';
                    line.style.top = centerY + 'px';
                    diagram.appendChild(line);

                    var field = inputs.find(input => {
                        var label = input.querySelector('label');
                        var shortenedLabel = label.textContent.split(',').pop().trim();
                        label.textContent = shortenedLabel;
                        return shortenedLabel === pos.label;
                    });
                    field.className = 'diagram-field';
                    var angleRad = pos.angle * (Math.PI / 180);

                    var fieldX = centerX + (radius + 20) * Math.cos(angleRad) * adjustmentRatio;
                    var fieldY = centerY + (radius + 20) * Math.sin(angleRad) * adjustmentRatio + verticalShift;

                    field.style.left = fieldX + 'px';
                    field.style.top = fieldY + 'px';
                    field.setAttribute('data-position', eyeSide + ' Eye, ' + pos.label);
                    diagram.appendChild(field);
                });

                return diagram;
            }

            function renderMotilityTest (parent, rightEyeInputs, leftEyeInputs) {
                var container = document.createElement('div');
                container.className = 'motility-test-container';

                var leftEyeDiagram = createEyeDiagram('Left', leftEyeInputs);
                var rightEyeDiagram = createEyeDiagram('Right', rightEyeInputs);

                container.appendChild(leftEyeDiagram);
                container.appendChild(rightEyeDiagram);

                parent.appendChild(container);
                return parent;
            }

            function createGonioscopyDiagram (eyeSide, inputs) {
                var diagram = document.createElement('div');
                diagram.className = 'gonioscopy-diagram ' + eyeSide + '-eye';

                var centerX = 150, centerY = 150, radius = 100;

                var positions = [
                    { angle: 0, label: "Right", x: 250, y: 120 },
                    { angle: 90, label: "Bottom", x: 160, y: 220 },
                    { angle: 180, label: "Left", x: 50, y: 120 },
                    { angle: 270, label: "Top", x: 160, y: 50 }
                ];

                // Create X-shaped cross
                var cross = document.createElement('div');
                cross.className = 'gonioscopy-cross';
                diagram.appendChild(cross);

                // Create center circle
                var circle = document.createElement('div');
                circle.className = 'gonioscopy-center';
                diagram.appendChild(circle);

                positions.forEach(function (pos) {
                    var field = inputs.find(input => {
                        var label = input.querySelector('label');
                        return label.textContent.includes(pos.label);
                    });
                    if (field) {
                        field.className = 'gonioscopy-field';
                        field.style.left = pos.x + 'px';
                        field.style.top = pos.y + 'px';
                        field.setAttribute('data-position', eyeSide + ' Eye, ' + pos.label);
                        diagram.appendChild(field);
                    }
                });

                return diagram;
            }

            function renderGonioscopyTest (parent, rightEyeInputs, leftEyeInputs) {
                var container = document.createElement('div');
                container.className = 'gonioscopy-test-container';

                var leftEyeDiagram = createGonioscopyDiagram('Left', leftEyeInputs);
                var rightEyeDiagram = createGonioscopyDiagram('Right', rightEyeInputs);

                container.appendChild(leftEyeDiagram);
                container.appendChild(rightEyeDiagram);

                parent.appendChild(container);
                return parent;
            }

            function findItemWithText () {
                var targetTexts = ["MOTILITY TEST", "GONIOSCOPY EVALUATION"];
                const headers = document.querySelectorAll('.table-header');

                targetTexts.forEach(targetText => {
                    const headerWithText = Array.from(headers).find(header => header.textContent.includes(targetText));
                    if (headerWithText) {
                        const parentDiv = headerWithText.parentElement;
                        parentDiv.style.position = 'relative';

                        const titles = parentDiv.querySelectorAll('.control-wrapper-content');
                        titles.forEach(title => {
                            title.style.display = 'flex';
                            title.style.justifyContent = 'center';
                        });

                        const inputs = parentDiv.querySelectorAll('.form-builder-column-wrapper');

                        const rightEyeInputs = Array.from(inputs).filter((input, index) => index % 2 !== 0);
                        const leftEyeInputs = Array.from(inputs).filter((input, index) => index % 2 === 0);

                        if (targetText === "MOTILITY TEST") {
                            renderMotilityTest(parentDiv, rightEyeInputs, leftEyeInputs);
                        } else if (targetText === "GONIOSCOPY EVALUATION") {
                            renderGonioscopyTest(parentDiv, rightEyeInputs, leftEyeInputs);
                        }
                    }
                });
            }

            var unMountReactContainer = function (formUuid) {
                var reactContainerElement = angular.element(document.getElementById(formUuid));
                reactContainerElement.on('$destroy', function () {
                    unMountForm(document.getElementById(formUuid));
                });
            };

            var controller = function ($scope) {
                var formUuid = $scope.form.formUuid;
                var formVersion = $scope.form.formVersion;
                var formName = $scope.form.formName;
                var formObservations = $scope.form.observations;
                var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                var validateForm = $scope.validateForm || false;
                var locale = $translate.use();

                if (!loadedFormDetails[formUuid]) {
                    spinner.forPromise(formService.getFormDetail(formUuid, { v: "custom:(resources:(value))" })
                        .then(function (response) {
                            var formDetailsAsString = _.get(response, 'data.resources[0].value');
                            if (formDetailsAsString) {
                                var formDetails = JSON.parse(formDetailsAsString);
                                formDetails.version = formVersion;
                                loadedFormDetails[formUuid] = formDetails;
                                var formParams = { formName: formName, formVersion: formVersion, locale: locale, formUuid: formUuid };
                                $scope.form.events = formDetails.events;
                                spinner.forPromise(formService.getFormTranslations(formDetails.translationsUrl, formParams)
                                    .then(function (response) {
                                        var formTranslations = !_.isEmpty(response.data) ? response.data[0] : {};
                                        loadedFormTranslations[formUuid] = formTranslations;
                                        $scope.form.component = renderWithControls(formDetails, formObservations,
                                            formUuid, collapse, $scope.patient, validateForm, locale, formTranslations);
                                    }, function () {
                                        var formTranslations = {};
                                        loadedFormTranslations[formUuid] = formTranslations;
                                        $scope.form.component = renderWithControls(formDetails, formObservations,
                                            formUuid, collapse, $scope.patient, validateForm, locale, formTranslations);
                                    })
                                );
                            }
                            unMountReactContainer($scope.form.formUuid);
                        })
                    );
                } else {
                    $timeout(function () {
                        $scope.form.events = loadedFormDetails[formUuid].events;
                        $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations,
                            formUuid, collapse, $scope.patient, validateForm, locale, loadedFormTranslations[formUuid]);
                        unMountReactContainer($scope.form.formUuid);
                    }, 0, false);
                }

                $scope.$watch('form.collapseInnerSections', function () {
                    var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                    if (loadedFormDetails[formUuid]) {
                        $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations,
                            formUuid, collapse, $scope.patient, validateForm, locale, loadedFormTranslations[formUuid]);
                    }
                });

                $scope.$watch('form.component', function (newValue) {
                    if (newValue) {
                        $timeout(function () {
                            findItemWithText();
                        }, 0);
                    }
                });

                $scope.$on('$destroy', function () {
                    if ($scope.$parent.consultation && $scope.$parent.consultation.observationForms) {
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
                    form: "=",
                    patient: "=",
                    validateForm: "="
                },
                controller: controller
            };
        }]);
