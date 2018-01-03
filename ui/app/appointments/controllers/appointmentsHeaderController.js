'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsHeaderController', ['$scope', '$state', 'appService',
        function ($scope, $state, appService) {
            var setBackLinks = function () {
                var backLinks = [{label: "Home", url: "../home/", accessKey: "h", icon: "fa-home"}];

                // TODO:permissions for admin
                backLinks.push({text: "APPOINTMENTS_MANAGE", state: "home.manage", accessKey: "M"});
                var enableAdminPage = appService.getAppDescriptor().getExtensionById('bahmni.appointments.admin', true);
                if (enableAdminPage) {
                    backLinks.push({text: "APPOINTMENTS_ADMIN", state: "home.admin.service", accessKey: "A", requiredPrivilege: Bahmni.Appointments.Constants.privilegeForAdmin});
                }
                $state.get('home').data.backLinks = backLinks;
            };
            var init = function () {
                setBackLinks();
            };
            return init();
        }]);
