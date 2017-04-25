'use strict';

angular.module('bahmni.ot')
    .controller('SurgicalAppointmentController', ['$scope', '$rootScope', 'spinner', '$q',
        function ($scope, $rootScope, spinner, $q) {
            var init = function () {
                return $q.when({});
            }
            spinner.forPromise(init());
        }]);