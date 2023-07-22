'use strict';

angular.module('bahmni.ot')
    .directive('otNotesDelete', [function () {
        return {
            restrict: 'E',
            require: '^otCalendar',
            templateUrl: "../ot/views/notesDeletePopup.html"
        };
    }]);
