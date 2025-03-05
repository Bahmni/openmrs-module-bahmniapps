'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['formService', 'spinner', '$timeout', '$translate',
        function (formService, spinner, $timeout, $translate) {
            var loadedFormDetails = {};
            var loadedFormTranslations = {};

            function createPrescriptionTable () {
                var columns = document.querySelectorAll('.form-builder-column');
                var prescriptionSection = '';

                // Find prescription section
                for (var i = 0; i < columns.length; i++) {
                    var strongElements = columns[i].getElementsByClassName('test-section-label');
                    for (var j = 0; j < strongElements.length; j++) {
                        if (strongElements[j].textContent.trim().indexOf("Eye Glass Treatment") !== -1) {
                            prescriptionSection = columns[i].getElementsByClassName('obsGroup-controls')[0];
                            presecriptionElement = columns[i];
                        }
                    }
                }

                if (prescriptionSection) {
                    // Create table elements
                    var table = document.createElement('table');
                    table.className = 'prescription-table';
                    var headerRow = document.createElement('tr');

                    // Create header cells
                    var headers = ['#', 'Right Eye', 'Left Eye'];
                    headers.forEach(function (headerText) {
                        var th = document.createElement('th');
                        th.textContent = headerText;
                        if (headerText !== '#') {
                            th.colSpan = '4';
                        }
                        headerRow.appendChild(th);
                    });

                    // Create subheader row
                    var subHeaderRow = document.createElement('tr');
                    var rxCell = document.createElement('th');
                    rxCell.textContent = 'RX';
                    subHeaderRow.appendChild(rxCell);

                    // Add subheaders for both eyes
                    ['Right Eye', 'Left Eye'].forEach(function () {
                        ['SPH', 'CYL', 'Axis', 'V/A'].forEach(function (text) {
                            var th = document.createElement('th');
                            th.textContent = text;
                            subHeaderRow.appendChild(th);
                        });
                    });

                    // Create rows with mapped cells for inputs
                    var rowLabels = ['Distance', 'Near'];
                    var rows = rowLabels.map(function (label) {
                        var tr = document.createElement('tr');
                        var labelCell = document.createElement('td');
                        labelCell.textContent = label;
                        labelCell.className = 'row-label';
                        tr.appendChild(labelCell);

                        // Add cells for both eyes
                        ['Right Eye', 'Left Eye'].forEach(function (eye) {
                            ['SPH', 'CYL', 'Axis', 'V/A'].forEach(function (type) {
                                var td = document.createElement('td');
                                td.className = 'input-cell';
                                td.setAttribute('data-eye', eye);
                                td.setAttribute('data-type', type);
                                td.setAttribute('data-row', label);
                                tr.appendChild(td);
                            });
                        });

                        return tr;
                    });

                    // Assemble table
                    table.appendChild(headerRow);
                    table.appendChild(subHeaderRow);
                    rows.forEach(function (row) {
                        table.appendChild(row);
                    });

                    // Create wrapper
                    var tableWrapper = document.createElement('div');
                    tableWrapper.className = 'prescription-table-wrapper';
                    tableWrapper.appendChild(table);

                    // Insert table

                    prescriptionSection.prepend(tableWrapper);
                }
            }

            function createPGTable () {
                var columns = document.querySelectorAll('.form-builder-column');
                var refractionSection = '';
                var pgObsGroup = '';

                // Find refraction record section
                for (var i = 0; i < columns.length; i++) {
                    var strongElements = columns[i].getElementsByClassName('test-section-label');
                    for (var j = 0; j < strongElements.length; j++) {
                        if (strongElements[j].textContent.trim() === "REFRACTION RECORD") {
                            refractionSection = columns[i];
                            pgObsGroup = columns[i].getElementsByClassName('obsGroup-controls')[0];
                            break;
                        }
                    }
                    if (refractionSection) break;
                }

                if (refractionSection) {
                    // Create table elements
                    var table = document.createElement('table');
                    table.className = 'pg-table';

                    // Create header row
                    var headerRow = document.createElement('tr');
                    var headers = ['PG Power:', 'Spherical', 'Cylinder', 'Axis', 'V/A with PG'];
                    headers.forEach(function (headerText, index) {
                        var th = document.createElement('th');
                        th.textContent = headerText;
                        if (index === 0) {
                            th.className = 'header-cell';
                            th.colSpan = 2;
                        }
                        headerRow.appendChild(th);
                    });

                    // Create DV (Distance Vision) rows
                    var dvRow1 = createRow('DV', 'RE:', 'Right Eye PG DV');
                    var dvRow2 = createSubRow('LE:', 'Left Eye PG DV');

                    // Create NV (Near Vision) rows
                    var nvRow1 = createRow('NV', 'RE:Add', 'Right Eye PG NV');
                    var nvRow2 = createSubRow('LE:Add', 'Left Eye PG NV');

                    // Assemble table
                    var tableWrapper = document.createElement('div');
                    tableWrapper.className = 'pg-table-wrapper';
                    table.appendChild(headerRow);
                    table.appendChild(dvRow1);
                    table.appendChild(dvRow2);
                    table.appendChild(nvRow1);
                    table.appendChild(nvRow2);
                    tableWrapper.appendChild(table);

                    // Add table to the refraction section
                    pgObsGroup.appendChild(tableWrapper);

                    // Move inputs to corresponding cells
                    moveInputsToCells(pgObsGroup, table);
                }
            }

            function createRow (mainLabel, subLabel, eyeIdentifier) {
                var tr = document.createElement('tr');

                // Create main label cell
                var mainLabelCell = document.createElement('td');
                mainLabelCell.textContent = mainLabel;
                mainLabelCell.rowSpan = 2;
                mainLabelCell.className = 'main-label';
                tr.appendChild(mainLabelCell);

                // Create sub label cell
                var subLabelCell = document.createElement('td');
                subLabelCell.textContent = subLabel;
                subLabelCell.className = 'sub-label';
                tr.appendChild(subLabelCell);

                // Create data cells
                ['Spherical', 'Cylinder', 'Axis', 'V/A with PG'].forEach(function (type) {
                    var td = document.createElement('td');
                    td.className = 'input-cell';
                    td.setAttribute('data-eye', eyeIdentifier);
                    td.setAttribute('data-type', type);
                    tr.appendChild(td);
                });

                return tr;
            }

            function createSubRow (subLabel, eyeIdentifier) {
                var tr = document.createElement('tr');

                // Create sub label cell
                var subLabelCell = document.createElement('td');
                subLabelCell.textContent = subLabel;
                subLabelCell.className = 'sub-label';
                tr.appendChild(subLabelCell);

                // Create data cells
                ['Spherical', 'Cylinder', 'Axis', 'V/A with PG'].forEach(function (type) {
                    var td = document.createElement('td');
                    td.className = 'input-cell';
                    td.setAttribute('data-eye', eyeIdentifier);
                    td.setAttribute('data-type', type);
                    tr.appendChild(td);
                });

                return tr;
            }

            function moveInputsToCells (section, table) {
                var inputWrappers = section.getElementsByClassName('form-builder-row');

                Array.prototype.forEach.call(inputWrappers, function (wrapper) {
                    var label = wrapper.querySelector('label');
                    if (label) {
                        var labelText = label.textContent.trim();
                        var matches = labelText.match(/^(.*?),\s*(.*?)\s*PG\s*(DV|NV)$/);

                        if (matches) {
                            var type = matches[1].trim();
                            var eye = matches[2].trim() + ' PG ' + matches[3];

                            // Find matching cell
                            var cell = table.querySelector(`td[data-eye="${eye}"][data-type="${type}"]`);
                            if (cell) {
                                var textareaContainer = wrapper.querySelector('.obs-control-field');
                                if (textareaContainer) {
                                    var dataEye = cell.getAttribute('data-eye');
                                    var dataType = cell.getAttribute('data-type');
                                    cell.appendChild(textareaContainer);
                                    wrapper.style.display = 'none';
                                    var textarea = textareaContainer.querySelector('textarea');
                                    if (textarea) {
                                        textarea.addEventListener('change', function () {
                                            var mappings = {
                                                'Right Eye PG DV,Spherical': 'Right Eye,SPH,Distance',
                                                'Right Eye PG DV,Cylinder': 'Right Eye,CYL,Distance',
                                                'Right Eye PG DV,Axis': 'Right Eye,Axis,Distance',
                                                'Right Eye PG DV,V/A with PG': 'Right Eye,V/A,Distance',
                                                'Left Eye PG DV,Spherical': 'Left Eye,SPH,Distance',
                                                'Left Eye PG DV,Cylinder': 'Left Eye,CYL,Distance',
                                                'Left Eye PG DV,Axis': 'Left Eye,Axis,Distance',
                                                'Left Eye PG DV,V/A with PG': 'Left Eye,V/A,Distance',
                                                'Right Eye PG NV,Spherical': 'Right Eye,SPH,Near',
                                                'Right Eye PG NV,Cylinder': 'Right Eye,CYL,Near',
                                                'Right Eye PG NV,Axis': 'Right Eye,Axis,Near',
                                                'Right Eye PG NV,V/A with PG': 'Right Eye,V/A,Near',
                                                'Left Eye PG NV,Spherical': 'Left Eye,SPH,Near',
                                                'Left Eye PG NV,Cylinder': 'Left Eye,CYL,Near',
                                                'Left Eye PG NV,Axis': 'Left Eye,Axis,Near',
                                                'Left Eye PG NV,V/A with PG': 'Left Eye,V/A,Near'
                                            };

                                            var key = `${dataEye},${dataType}`;
                                            var targetCell = mappings[key];
                                            var [eyeParam, typeParam, rowParam] = targetCell.split(',');
                                            var targetElement = document.querySelector(`td[data-eye="${eyeParam}"][data-type="${typeParam}"][data-row="${rowParam}"]`);
                                            if (targetElement) {
                                                targetElement.innerText = textarea.value;
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                });
            }

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
                    const headerWithText = Array.from(headers).find(header => header.textContent.toLowerCase().includes(targetText.toLowerCase()));
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
                            createPrescriptionTable();
                            createPGTable();
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
