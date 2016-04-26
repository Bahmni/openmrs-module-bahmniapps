'use strict';

angular.module('bahmni.common.patient')
    .directive('patientImage', function () {
        var link = function ($scope, element, attr) {
            $scope.klass=attr.class;
            var imageTag = element.find("img");
            imageTag.error(function() {
                this.onerror=null;
                this.src= $scope.alt || '../images/blank-user.gif';
            });
        };

        return {
            restrict: 'E',
            template: '<img class="{{klass}}" ng-src="{{patient.image}}"/>',
            scope: {
                patient: "=",
                alt: "@"
            },
            link: link
        }
    }
);