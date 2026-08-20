'use strict';

angular.module('bahmni.ot')
    .directive('listView', ['appService', function (appService) {
        return {
            restrict: 'E',
            controller: "listViewController",
            scope: {
                viewDate: "=",
                filterParams: "=",
                weekStartDate: "=",
                weekEndDate: "=",
                weekOrDay: "="
            },
            templateUrl: function () {
                return appService.getAppDescriptor().getConfigValue("listViewTemplateUrl") || "../ot/views/listView.html";
            }
        };
    }]);
