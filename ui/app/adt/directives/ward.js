'use strict';

angular.module('bahmni.adt')
    .directive('ward',[ function () {
        return {
            restrict: 'E',
            controller: "WardController",
            scope: {
                ward:"=",
                bedAssignable:"=",
                encounterUuid: "=",
                patientUuid: "=",
                visitUuid: "="
    },
            templateUrl: "../adt/views/ward.html"
        };
    }])
    .directive('bedAssignmentDialog', function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.bind('click', function (e) {
                    scope.setBedDetails(scope.cell);
                    var leftPos = $(elem).offset().left - 132;
                    var topPos = $(elem).offset().top;
                    var bedInfoElem = $(elem).closest('.ward').find(".bed-info");
                    bedInfoElem.css('left', leftPos);
                    bedInfoElem.css('top', topPos);
                    e.stopPropagation();
                });
            }
        };
    });
