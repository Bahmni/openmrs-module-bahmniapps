'use strict';

angular.module('registration.patientCommon', ['resources.patientAttributeService', 'registration.photoCapture','resources.addressAttributeService'])
    .controller('PatientCommonController', ['$scope','$http', 'patientAttributeService','addressAttributeService',
        function ($scope, $http, patientAttributeService, addressAttributeService) {

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            }

            $scope.getLastNameList = function (query) {
                return patientAttributeService.search("familyName", query);
            }

            $scope.getCasteList = function (query) {
                return patientAttributeService.search("caste", query);
            }

            $scope.getDataResults = function (data) {
                return  data.resultList.results;
            }

            var addressLevels = ["cityVillage",  "address3", "countyDistrict", "stateProvince"];

            $scope.getAddressDataResults = function (data) {
                return data.map(function(addressField){return {'value': addressField.name, 'label': addressField.name + ( addressField.parent ?  ", " + addressField.parent.name : "" ), addressField: addressField}});
            }

            $scope.getVillageList = function (query) {
                return addressAttributeService.search("cityVillage", query);
            }

            $scope.villageSelected = function (item) {
                addressFieldSelected("cityVillage", item.addressField);
            }

            $scope.getDistrictList = function (query) {
                return addressAttributeService.search("countyDistrict", query);
            }

            $scope.districtSelected = function (item) {
                addressFieldSelected("countyDistrict", item.addressField);
            }

            $scope.getTehsilList = function (query) {
                return addressAttributeService.search("address3", query);
            }

            $scope.tehsilSelected = function (item) {
                addressFieldSelected("address3", item.addressField);
            }

            var addressFieldSelected = function (fieldName, addressFiled) {
                var parentFields = addressLevels.slice(addressLevels.indexOf(fieldName) + 1);
                var parent = addressFiled.parent;
                parentFields.forEach(function(parentField){
                    if(!parent) return;
                    $scope.patient.address[parentField] = parent.name;
                    parent = parent.parent;
                });
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
                minLength: 2,
                source: function (request, response) {
                    var autoCompleteConfig = angular.fromJson(attrs.myAutocomplete);
                    scope[autoCompleteConfig.src](request.term).success(function (data) {
                        var results = scope[autoCompleteConfig.responseMap](data);
                        response(results);
                    });;
                },
                select: function (event, ui) {
                    var autoCompleteConfig = angular.fromJson(attrs.myAutocomplete);
                    scope.$apply(function (scope) {
                        ngModel.assign(scope, ui.item.value);
                        scope.$eval(attrs.ngChange);
                        scope[autoCompleteConfig.onSelect](ui.item);
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
