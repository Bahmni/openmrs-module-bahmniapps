'use strict';

angular.module('bahmni.registration')
    .directive('patientImage', function () {
        var link = function ($scope, element) {
            var imageTag = element.find("#patient-image");
            imageTag.error(function() {
                this.onerror=null;
                this.src='../images/blank-user.gif';
            });
        };

        return {
            restrict: 'E',
            template: '<img id="patient-image" ng-src="{{patient.image}}"/>',
            scope: {
                patient: "="
            },
            link: link
        }
    }
);