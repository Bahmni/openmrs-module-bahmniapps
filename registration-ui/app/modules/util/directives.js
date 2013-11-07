angular.module('registration.util', [])
    .directive('nonBlank', function () {
        return function ($scope, element, attrs) {
            var addNonBlankAttrs = function () {
                element.attr({'required': 'required', "pattern": '^.*[^\\s]+.*'});
            };

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
    .directive('splitButton', function ($parse) {
        var link = function($scope, element) {            
            var toggleButton = element.find('.toggle-button');

            toggleButton.on('click', function(){
                element.find('.secondaryOption').toggle();
            });

            $(document).on('click', function(e){
                var $clicked = $(e.target);
                if (!$clicked.closest(element).length) {
                   element.find('.secondaryOption').hide(); 
                }
            });
        };

        var controller = function($scope) {
            $scope.sortedOptions = (function() {
                var indexOfPrimaryOption = $scope.options.indexOf($scope.primaryOption)
                if(indexOfPrimaryOption > 0){                    
                    var clonedOptions = $scope.options.slice(0);
                    clonedOptions.splice(indexOfPrimaryOption, 1);
                    clonedOptions.splice(0, 0, $scope.primaryOption)
                    return clonedOptions;
                } else {
                    return $scope.options;
                }
            })();
        }

        return {
            restrict: 'A',
            template: '<ul>' +
                            '<li ng-repeat="option in sortedOptions"' +
                                'ng-class="{primaryOption: $index == 0, secondaryOption: $index > 0}"' +
                                'ng-show="$index == 0"' +
                             '>' +
                                '<button ng-click="optionClick()(option)">{{optionText()(option)}}</a>' +
                            '</li>' +
                        '</ul>' +
                        '<button class="toggle-button" type="button">+</button>',
            link: link,
            controller: controller,
            scope: {
                options: '=',
                primaryOption: '=',
                optionText: '&',
                optionClick: '&'
            }
        };
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
                    });
                },
                select: function (event, ui) {
                    var autoCompleteConfig = angular.fromJson(attrs.myAutocomplete);
                    scope.$apply(function (scope) {
                        ngModel.assign(scope, ui.item.value);
                        scope.$eval(attrs.ngChange);
                        if(autoCompleteConfig.onSelect != null && scope[autoCompleteConfig.onSelect] != null) {
                            scope[autoCompleteConfig.onSelect](ui.item);
                        }
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
