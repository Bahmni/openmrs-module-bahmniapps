'use strict';

angular.module('opd.consultation.controllers')
    .controller('TreatmentController', ['$scope', '$rootScope', 'treatmentService', function ($scope, $rootScope, treatmentService) {
        $scope.placeholder = "Add Treatment Advice";
        
        $scope.searchResults = [];

        $scope.selectedDrugs = [];

        var areStringsEqual = function(str1, str2) {
            if ((str1) && (!str2)) {
                return false;
            }

            if ((!str1) && (str2)) {
                return false;
            }

            return str1 === str2;
        }

        $scope.addNewRowIfNotExists = function (index) {
            var drugBeingEdited = $scope.selectedDrugs[index];
            var drugName = drugBeingEdited.name || '';

            drugBeingEdited.empty = areStringsEqual($.trim(drugName), "");

            if (!drugBeingEdited.empty) {
                if (!areStringsEqual($.trim(drugName), $.trim(drugBeingEdited.originalName))) {
                    drugBeingEdited.uuid = "";
                    drugBeingEdited.strength = "";
                    drugBeingEdited.dosageForm = "";
                    drugBeingEdited.numberPerDosage = "";
                }
            }

            var length = $scope.selectedDrugs.length;
            if ($scope.selectedDrugs[length - 1]) {
                var lastItem = $scope.selectedDrugs[length - 1];
                if (lastItem.name) {
                    $scope.selectedDrugs.push(new Bahmni.Opd.Consultation.TreatmentDrug());
                }
                else if ($scope.selectedDrugs[length - 2] && !$scope.selectedDrugs[length - 2].name) {
                    $scope.selectedDrugs.pop();
                }
            }
        };

        var formattedString = function(formatStr, args) {
            return formatStr.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
                if (m == "{{") { return "{"; }
                if (m == "}}") { return "}"; }
                return args[n];
            });
        }


        $scope.getDataResults = function (data) {
            var labels = [];
            $scope.searchResults = data.results;

            data.results.forEach(
                function (record) {
                    labels.push(
                        {
                            label: formattedString("{0} {1} {2} {3} ({4})",
                                [record.name, record.doseStrength || '', record.units || '', record.dosageForm.name.name, record.concept.name.name]),
                            value: record.name,
                            lookup: record.uuid
                        }
                    );
                }
            );
            return labels;
        };

        $scope.getDrugList = function (query) {
            return treatmentService.search(query);
        };

        $scope.onDrugSelected = function (index, uuid) {
            if ($scope.searchResults) {
                var drugs = $scope.searchResults.filter(
                    function (record) {
                        return record.uuid === uuid;
                    }
                );
                if (drugs.length > 0) {
                    var selectedDrug = $scope.selectedDrugs[index];
                    var chosenDrug = drugs[0];
                    selectedDrug.name = chosenDrug.name;
                    selectedDrug.originalName = chosenDrug.name;
                    selectedDrug.uuid = chosenDrug.uuid;
                    selectedDrug.strength = (chosenDrug.doseStrength || '') + ' ' + (chosenDrug.units || '');
                    selectedDrug.dosageForm = chosenDrug.dosageForm.name.name;
                    selectedDrug.concept = { uuid: chosenDrug.concept.uuid};
                    selectedDrug.numberPerDosage = 1;
                    selectedDrug.empty = false;
                }
            }

        };

        $scope.saveTreatment = function () {
            var noOfDrugs = $scope.selectedDrugs.length;
            var lastDrug = $scope.selectedDrugs[noOfDrugs - 1];
            if (lastDrug.uuid === '') {
                $scope.selectedDrugs = $scope.selectedDrugs.slice(0, noOfDrugs - 1);
            }
        };

        $scope.removeDrug = function (index) {
            $scope.selectedDrugs.splice(index, 1);
        };

        var allowContextChange = function () {
            var invalidDrugs = $scope.selectedDrugs.filter(function (drug) {
                return !isValidDrug(drug);
            });
            return invalidDrugs.length === 0;
        };

        var isValidDrug = function (drug) {
            if (!drug.empty) {
                if (!$scope.isValidDrugName(drug)) {
                    return false;
                }
                if (!$scope.isValidNumberPerDosage(drug)) {
                    return false;
                }

                if (!$scope.isValidNumberOfDosageDays(drug)) {
                    return false;
                }

                if (!$scope.isValidDosageFrequency(drug)) {
                    return false;
                }
            }
            return true;
        };

        $scope.isValidDrugName = function (drug) {
            return drug.empty || drug.uuid != '';
        };

        $scope.isValidNumberPerDosage = function (drug) {
            var doses = drug.numberPerDosage || null;
            return  drug.empty || (doses != null && doses != '');
        };

        $scope.isValidDosageFrequency = function (drug) {
            var frequency = drug.dosageFrequency || null;
            return  drug.empty || (drug.prn || (frequency != null && frequency != ''));
        };

        $scope.isValidNumberOfDosageDays = function (drug) {
            var dosageDays = drug.numberOfDosageDays || null;
            return  drug.empty || (dosageDays != null && dosageDays != '');
        };

        $scope.$on('$destroy', function() {

            $rootScope.consultation.treatmentDrugs = $scope.selectedDrugs.filter(function(drug){
                return !drug.empty;
            });

        });

        var initialize = function () {
            $scope.dosageFrequencyAnswers = [];
            if ($scope.dosageFrequencyConfig.results.length > 0) {
                $scope.dosageFrequencyAnswers = $scope.dosageFrequencyConfig.results[0].answers;
            }

            $scope.dosageInstructionAnswers = [];
            if ($scope.dosageInstructionConfig.results.length > 0) {
                $scope.dosageInstructionAnswers = $scope.dosageInstructionConfig.results[0].answers;
            }

            $rootScope.beforeContextChange = allowContextChange;

            if ($rootScope.consultation.treatmentDrugs) {
                $scope.selectedDrugs = $rootScope.consultation.treatmentDrugs;
                $scope.selectedDrugs.push(new Bahmni.Opd.Consultation.TreatmentDrug());
            } else {
                $scope.selectedDrugs = [ new Bahmni.Opd.Consultation.TreatmentDrug() ];
            }
        };

        initialize();

    }])

    .directive('myAutocomplete', function ($parse) {
        return function (scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            element.autocomplete({
                autofocus: true,
                minLength: 2,
                source: function (request, response) {
                    var args = angular.fromJson(attrs.myAutocomplete);
                    scope[args.src](request.term).success(function (data) {
                        var results = scope[args.responseHandler](data);
                        response(results);
                    });
                },
                select: function (event, ui) {
                    var args = angular.fromJson(attrs.myAutocomplete);
                    scope.$apply(function () {
                        ngModel.assign(scope, ui.item.value);
                        if (args.onSelect != null && scope[args.onSelect] != null) {
                            scope[args.onSelect](args.index, ui.item.lookup);
                        }
                        scope.$eval(attrs.ngChange);
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < 2) {
                        event.preventDefault();
                    }
                }
            });
        }
    });
