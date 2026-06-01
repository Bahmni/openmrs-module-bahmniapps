'use strict';

angular.module('bahmni.reports')
    .controller('DashboardHeaderController', ['$scope', 'appService', '$state',
        function ($scope, appService, $state) {
            var setBackLinks = function () {
                var backLinks = [{label: "Home", url: "../home/", accessKey: "h", icon: "fa-home"}];
                if (appService.getAppDescriptor().getConfigValue("enableReportQueue")) {
                    backLinks.push({text: "REPORTS_HEADER_REPORTS", state: "dashboard.reports", accessKey: "d"});
                    backLinks.push({text: "REPORTS_HEADER_MY_REPORTS", state: "dashboard.myReports", accessKey: "m"});
                }
                $state.get('dashboard').data.backLinks = backLinks;
            };
            var init = function () {
                setBackLinks();
            };
            return init();
        }]);
