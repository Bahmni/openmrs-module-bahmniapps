'use strict';

angular.module('bahmni.common.i18n',['pascalprecht.translate'])
    .provider('$bahmniTranslate', $bahmniTranslateProvider).
    filter('titleTranslate', ['$translate', function ($translate) {
        return function (input) {
            if (!input) {
                return input;
            }
            if (input.translationKey) {
                return $translate.instant(input.translationKey);
            }
            if (input.dashboardName) {
                return input.dashboardName;
            }
            if (input.title) {
                return input.title;
            }
            if (input.label) {
                return input.label;
            }
            return null;
        }
    }]);

function $bahmniTranslateProvider($translateProvider){
    this.init = function(options){
        $translateProvider.useLoader('mergeLocaleFilesService', options);
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.preferredLanguage('en');
        $translateProvider.useLocalStorage();
    };
    this.$get = [function () {
        return $translateProvider;
    }];
};

$bahmniTranslateProvider.$inject = ['$translateProvider'];