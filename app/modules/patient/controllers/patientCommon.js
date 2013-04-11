'use strict';

angular.module('registration.patientCommon', ['resources.autoCompleteService'])
    .controller('PatientCommonController', ['$scope', 'autoCompleteService',
    function ($scope, autoCompleteService) {

        $scope.setCasteAsLastName = function() {
            if($scope.patient.sameAsLastName) {
                $scope.patient.caste = $scope.patient.familyName;
            }
        }

        $scope.getAutoCompleteList = function (key, query) {
            var result = autoCompleteService.getAutoCompleteList(key,query);
            return result;
        }

        $scope.$watch('patient.familyName', function() {
            if($scope.patient.sameAsLastName) {
                $scope.patient.caste = $scope.patient.familyName;
            }
        });

        $scope.$watch('patient.caste', function() {
            if($scope.patient.sameAsLastName) {
                $scope.patient.familyName = $scope.patient.caste;
            }
        });
    }])

    .directive('nonBlank', function () {
        return function ($scope, element, attrs) {
            var addNonBlankAttrs = function(){
                element.attr({'required': 'required', "pattern": '^.*[^\\s]+.*'});
            }

            var removeNonBlankAttrs = function() {
                element.removeAttr('required').removeAttr('pattern');
            };

            if(!attrs.nonBlank) return addNonBlankAttrs(element);

            $scope.$watch(attrs.nonBlank, function(value){
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

    .directive('myAutocomplete', function() {
        return function (scope, element, attrs) {
            element.autocomplete({
                autofocus: true,
                minLength:3,
                source:function(request, response){
                    scope.getAutoCompleteList(element[0].id, request.term).success(function(data){
                        response(data.resultList.results)
                    });
                },
                select:function (event, ui) {
                    scope.$apply(function(scope){
                        scope.patient[element[0].id]= ui.item.value;
                        scope.$eval(attrs.ngChange);
                    });
                    return true;
                },
                search: function(event, ui){
                    var searchTerm = $.trim(element.val());
                    if(searchTerm.length < 3)
                    {
                        event.preventDefault();
                    }
                }
            });
        }
    });