angular.module('bahmni.common.uiHelper')
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
                                '<button ng-class="buttonClass" ng-click="optionClick()(option.uuid)">Start {{option.name}} Visit</a>' +
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
    });