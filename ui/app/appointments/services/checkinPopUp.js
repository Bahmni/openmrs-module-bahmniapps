'use strict';

angular.module('bahmni.common.uiHelper')
    .service('checkinPopUp', ['$rootScope', 'ngDialog', function ($rootScope, ngDialog) {
        var checkinPopUp = function (config) {
            var popUpScope = $rootScope.$new();
            var scope = config.scope;

            popUpScope.scope = scope;
            popUpScope.checkinTime = moment().seconds(0).milliseconds(0).toDate();

            ngDialog.open({
                template: '../appointments/views/checkInPopUp.html',
                scope: popUpScope,
                className: config.className || 'ngdialog-theme-default'
            });

            var dialogId = ngDialog.latestID;
            popUpScope.close = function () {
                ngDialog.close(dialogId, true);
                popUpScope.$destroy();
            };

            popUpScope.checkIn = function (checkinTime) {
                scope.confirmAction('CheckedIn');
            };
        };
        return checkinPopUp;
    }]);
