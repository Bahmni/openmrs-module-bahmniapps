angular.module('bahmni.common.uiHelper')
    .directive('bmPopOver', function(){
        var controller = function($scope) {
            $scope.targetElements = [];

            var hideTargetElements = function() {
                $scope.targetElements.forEach(function(el) { el.hide(); } );
            };

            var showTargetElements = function() {
                $scope.targetElements.forEach(function(el) { el.show(); } );
            };

            this.registerTriggerElement = function(triggerElement) {
                $scope.triggerElement = triggerElement;

                var docClickHandler = function(e) {
                    var $clicked = $(e.target);
                    if ($clicked.closest($scope.targetElements).length !== 0) {
                        hideTargetElements();
                        $scope.isTargetOpen = false;
                        $(document).off('click', docClickHandler);
                    }
                };

                $scope.triggerElement.on('click', function() {
                    if($scope.isTargetOpen) {
                        $scope.isTargetOpen = false;
                        hideTargetElements(0)
                        $(document).off('click', docClickHandler);
                    } else {
                        $scope.isTargetOpen = true;
                        showTargetElements();
                        $(document).on('click', docClickHandler);
                    }
                });
            };

            this.registerTargetElement = function(targetElement) {
                targetElement.hide();
                $scope.targetElements.push(targetElement);
            };
        };

        return {
            restrict: 'A',
            controller: controller
        }
    })
    .directive('bmPopOverTarget', function(){
        var link = function($scope, element, attrs, popOverController) {
            popOverController.registerTargetElement(element);
        };

        return {
            restrict: 'A',
            require: '^bmPopOver',
            link: link
        }
    })
    .directive('bmPopOverTrigger', function(){
        var link = function($scope, element, attrs, popOverController) {
            popOverController.registerTriggerElement(element);
        };

        return {
            restrict: 'A',
            require: '^bmPopOver',
            link: link
        }
    });