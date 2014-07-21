angular.module('bahmni.common.util')
    .directive('nonBlank', function () {
        return function ($scope, element, attrs) {
            var addNonBlankAttrs = function () {
                if(!attrs.attrPattern) {
                    element.attr({'required': 'required', "pattern": '^.*[^\\s]+.*'});
                } else {
                    element.attr({'required': 'required', "pattern": $scope[attrs.attrPattern]});
                }
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
        var link = function ($scope, element, attrs, ngModel) {
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
                        ngModel.$setViewValue(dateText);
                    });
                }
            });
        }

        return {
            require: 'ngModel',
            link: link
        }
    })
    .directive('splitButton', function ($parse) {
        var link = function($scope, element) {            
            var toggleButton = element.find('.toggle-button');

            var docClickHandler = function(e) {
                var $clicked = $(e.target);
                if ($clicked.closest(toggleButton).length === 0 || $clicked.closest(element.find('.options')).length !== 0) {
                    element.find('.secondaryOption').hide();
                    toggleButton.removeClass('open'); 
                    $(document).off('click', docClickHandler);
                }
            }

            toggleButton.on('click', function(){
                element.find('.secondaryOption').toggle();
                element.find('.secondaryOption button')[0].focus();
                if(toggleButton.hasClass('open')) {
                    toggleButton.removeClass('open');
                    $(document).off('click', docClickHandler);
                } else {
                    $(document).on('click', docClickHandler);
                    toggleButton.addClass('open');
                }
                }
            );
            
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

            $scope.hasMultipleOptions = function() {
                return $scope.options.length > 1;
            }
        }

        return {
            restrict: 'A',
            template: '<div class="split-button">'+
                            '<ul class="options">' +
                            '<li ng-repeat="option in sortedOptions"' +
                                'ng-class="{primaryOption: $index == 0, secondaryOption: $index > 0}"' +
                             '>' +
                                '<button ng-class="buttonClass" ng-click="optionClick()(option)">{{optionText()(option)}}</button>' +
                            '</li>' +
                        '</ul>' +
                        '<button class="toggle-button icon-caret-down" ng-show="hasMultipleOptions()" type="button"></button></div>',
            link: link,
            controller: controller,
            scope: {
                options: '=',
                primaryOption: '=',
                optionText: '&',
                optionClick: '&',
                buttonClass: '='
            }
        };
    })


    .directive('focusOn', function () {
        return function (scope, elem, attrs) {
            scope.$watch(attrs.focusOn, function (value) {
                if (value) {
                    elem[0].focus();
                }
            });
        };
    })

    .directive('myAutocomplete', function ($parse) {
        var link = function (scope, element, attrs, ngModelCtrl) {
            var ngModel = $parse(attrs.ngModel);
            var source = scope.source();
            var responseMap = scope.responseMap();
            var onSelect = scope.onSelect();

            element.autocomplete({
                autofocus: true,
                minLength: 2,
                source: function (request, response) {
                    source(attrs.id, request.term, attrs.type).success(function (data) {
                        var results = responseMap ? responseMap(data) : data ;
                        response(results);
                    });
                },
                select: function (event, ui) {
                    scope.$apply(function (scope) {
                        ngModelCtrl.$setViewValue(ui.item.value);
                        scope.$eval(attrs.ngChange);
                        if(onSelect != null) {
                            onSelect(ui.item);
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
        return {
            link: link,
            require: 'ngModel',
            scope: {
                source: '&',
                responseMap: '&',
                onSelect: '&'
            }
        }
    })
    .directive('autofillable', function () {
        return function (scope, elem, attrs) {
            setTimeout(function () {
                elem.unbind('submit').submit(function (e) {
                    e.preventDefault();
                    elem.find('input').trigger('change');
                    scope.$apply(attrs.ngSubmit);
                });
            }, 0);
        }
    })
    .directive("popUp", function (imageObservationGalleryControl) {
        var link = function (scope, elem) {
            var items = [];
            $(elem).click(function(){
                scope.onClickHandler()().then(function (response) {
                    scope.records = new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
                    scope.title = "Patient Documents"
                    imageObservationGalleryControl.open(scope);
                });
            });
        };
        return {
            link: link,
            scope: {
                onClickHandler: "&",
                patient: "="
            }
        }
    });