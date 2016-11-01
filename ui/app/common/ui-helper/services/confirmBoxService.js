'use strict';

angular.module('bahmni.common.uiHelper')
    .service('confirmBox', ['$rootScope', 'ngDialog', function ($rootScope, ngDialog) {
        var confirmBox = function (config) {
            var confirmBoxScope = $rootScope.$new();
            confirmBoxScope.close = function () {
                ngDialog.close();
                confirmBoxScope.$destroy();
            };
            confirmBoxScope.scope = config.scope;
            confirmBoxScope.actions = config.actions;
            ngDialog.open({
                template: '../common/ui-helper/views/confirmBox.html',
                scope: confirmBoxScope,
                className: config.className || 'ngdialog-theme-default'
            });
        };
        return confirmBox;
    }]);
