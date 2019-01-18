'use strict';

angular.module('bahmni.common.uiHelper')
    .service('checkinPopUp', ['$rootScope', 'ngDialog', function ($rootScope, ngDialog) {
        var confirmBox = function (config) {
            var dialog;
            var scope = config.scope;
            scope.checkedInAppointment = {time: moment().seconds(0).milliseconds(0).toDate()};
            scope.close = function () {
                ngDialog.close(dialog.id);
                scope.$destroy();
            };
            dialog = ngDialog.open({
                template: '../appointments/views/checkInPopUp.html',
                scope: scope,
                className: config.className || 'ngdialog-theme-default'
            });

            scope.performAction = function () {
                scope.action(scope.checkedInAppointment.time, scope.close);
            };
        };
        return confirmBox;
    }]);
