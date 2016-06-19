'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('toggle', function () {
        var link = function ($scope, element) {
            //$scope.$watch("toggle", function (value) {
            //    if(value!= undefined) {
            //        $(element).toggleClass('active', value)
            //    }
            //});
            $scope.toggle && $(element).addClass('active',$scope.toggle);
            $(element).click(function () {
                $scope.$apply(function () {
                    $scope.toggle = !$scope.toggle
                    $(element).toggleClass('active', $scope.toggle)
                });
            });

            $scope.$on("$destroy", function(){
               element.off('click');
            });
        };

        return {
            scope: {
                toggle: "="
            },
            link: link
        }
    });
