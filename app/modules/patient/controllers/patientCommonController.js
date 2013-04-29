'use strict';

angular.module('registration.patientCommon', ['resources.autoCompleteService', 'registration.photoCapture'])
    .controller('PatientCommonController', ['$scope', 'autoCompleteService',
        function ($scope, autoCompleteService) {

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            }

            $scope.getLastNameList = function (query) {
                return autoCompleteService.getAutoCompleteList("familyName", query);
            }

            $scope.getCasteList = function (query) {
                return autoCompleteService.getAutoCompleteList("caste", query);
            }

            $scope.getDataResults = function (data) {
                return  data.resultList.results;
            }

            $scope.$watch('patient.familyName', function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            });

            $scope.$watch('patient.caste', function () {
                if ($scope.patient.sameAsLastName && ($scope.patient.familyName != $scope.patient.caste)) {
                    $scope.patient.sameAsLastName = false;
                }
            });
        }])

    .directive('nonBlank', function () {
        return function ($scope, element, attrs) {
            var addNonBlankAttrs = function () {
                element.attr({'required': 'required', "pattern": '^.*[^\\s]+.*'});
            }

            var removeNonBlankAttrs = function () {
                element.removeAttr('required').removeAttr('pattern');
            };

            if (!attrs.nonBlank) return addNonBlankAttrs(element);

            $scope.$watch(attrs.nonBlank, function (value) {
                return value ? addNonBlankAttrs() : removeNonBlankAttrs();
            });
        }
    })

    .directive('datepicker', function ($parse) {
        return function ($scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            $(function () {
                var today = new Date();
                element.datepicker({
                    changeYear: true,
                    changeMonth: true,
                    maxDate: today,
                    minDate: "-120y",
                    yearRange: 'c-120:c',
                    dateFormat: 'dd-mm-yy',
                    onSelect: function (dateText) {
                        $scope.$apply(function (scope) {
                            ngModel.assign(scope, dateText);
                            $scope.$eval(attrs.ngChange);
                        });
                    }
                });
            });
        }
    })

    .directive('myAutocomplete', function ($parse) {
        return function (scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            element.autocomplete({
                autofocus: true,
                minLength: 3,
                source: function (request, response) {
                    var autoCompleteConfig = angular.fromJson(attrs.myAutocomplete);
                    scope[autoCompleteConfig.src](request.term).success(function (data) {
                        response(scope[autoCompleteConfig.responseMap](data));
                    });;
                },
                select: function (event, ui) {
                    scope.$apply(function (scope) {
                        ngModel.assign(scope, ui.item.value);
                        scope.$eval(attrs.ngChange);
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < 3) {
                        event.preventDefault();
                    }
                }
            });
        }
    });
