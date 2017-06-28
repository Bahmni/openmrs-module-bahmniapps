'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsHeaderController', ['$scope', 'appService', '$state',
        function ($scope, appService, $state) {
            var setBackLinks = function () {
                var backLinks = [{label: "Home", url: "../home/", accessKey: "h", icon: "fa-home"}];

                var isAdminUser = true;                 // TODO:permissions for admin

                backLinks.push({text: "APPOINTMENTS_MANAGE", state: "home.manage", accessKey: "m"});
                if (isAdminUser) {
                    backLinks.push({text: "APPOINTMENTS_ADMIN", state: "home.admin", accessKey: "a"});
                }
                $state.get('home').data.backLinks = backLinks;
            };
            var init = function () {
                setBackLinks();
            };
            return init();
        }]);
