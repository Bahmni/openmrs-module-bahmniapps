'use strict';

angular.module('bahmni.common.patient')
    .directive('eventStopPropagation', function () {
        return {
            link: function(scope, elem, attrs) {
                elem.on(attrs.eventStopPropagation, function(e){
                    e.stopPropagation();
                });
            }
        };
    }
);