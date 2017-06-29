'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsHeaderController', ['$scope', '$state',
        function ($scope, $state) {
            var setBackLinks = function () {
                var backLinks = [{label: "Home", url: "../home/", accessKey: "h", icon: "fa-home"}];

                // TODO:permissions for admin

                backLinks.push({text: "APPOINTMENTS_MANAGE", state: "home.manage", accessKey: "M"});
                backLinks.push({text: "APPOINTMENTS_ADMIN", state: "home.admin", accessKey: "A"});
                $state.get('home').data.backLinks = backLinks;
            };
            var init = function () {
                setBackLinks();
            };
            return init();
        }]);
