'use strict';

angular.module('bahmni.common.i18n',['pascalprecht.translate'])
    .provider('$bahmniTranslate', $bahmniTranslateProvider);

function $bahmniTranslateProvider($translateProvider){
    this.init = function(moduleName){
        $translateProvider.useStaticFilesLoader({
            prefix: '../i18n/'+ moduleName +'/locale_',
            suffix: '.json'
        });
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.preferredLanguage('en');
        $translateProvider.useLocalStorage();
    };
    this.$get = [function () {
        return $translateProvider;
    }];
};

$bahmniTranslateProvider.$inject = ['$translateProvider'];