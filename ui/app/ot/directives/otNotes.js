'use strict';

angular.module('bahmni.ot')
    .directive('otNotes', [function () {
        return {
            restrict: 'E',
            require: '^otCalendar',
            controller: "otCalendarController",
            templateUrl: "../ot/views/notesModal.html"
        };
    }]);
