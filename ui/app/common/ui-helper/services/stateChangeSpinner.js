'use strict';

angular.module('bahmni.common.uiHelper')
    .service('stateChangeSpinner', ['$rootScope', 'spinner', function ($rootScope, spinner) {
        var showSpinner = function (event, toState) { toState.spinnerToken = spinner.show(); };
        var hideSpinner = function (event, toState) { spinner.hide(toState.spinnerToken); };

        this.activate = function () {
            $rootScope.$on('$stateChangeStart', showSpinner);
            $rootScope.$on('$stateChangeSuccess', hideSpinner);
            $rootScope.$on('$stateChangeError', hideSpinner);
        };
    }]);
