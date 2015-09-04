'use strict';

angular.module('bahmni.common.i18n',['pascalprecht.translate'])
    .provider('$bahmniTranslate', $bahmniTranslateProvider);

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