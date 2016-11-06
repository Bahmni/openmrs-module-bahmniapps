'use strict';

angular.module('bahmni.common.i18n', ['pascalprecht.translate'])
    .provider('$bahmniTranslate', ['$translateProvider', function ($translateProvider) {
        this.init = function (options) {
            var preferredLanguage = window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en";
            $translateProvider.useLoader('mergeLocaleFilesService', options);
            $translateProvider.useSanitizeValueStrategy('escaped');
            $translateProvider.preferredLanguage(preferredLanguage);
            $translateProvider.useLocalStorage();
        };
        this.$get = [function () {
            return $translateProvider;
        }];
    }
    ])
    .filter('titleTranslate', ['$translate', function ($translate) {
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
            if (input.display) {
                return input.display;
            }
            return $translate.instant(input);
        };
    }]);
