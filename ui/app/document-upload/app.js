'use strict';

angular.module('documentupload', ['ui.router', 'bahmni.common.config', 'opd.documentupload', 'bahmni.common.patient',
    'authentication', 'bahmni.common.appFramework', 'ngDialog', 'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.i18n',
    'bahmni.common.uiHelper', 'ngSanitize', 'bahmni.common.patientSearch', 'bahmni.common.util', 'bahmni.common.routeErrorHandler', 'pascalprecht.translate', 'ngCookies']);
angular.module('documentupload').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$bahmniTranslateProvider', '$compileProvider',
    function ($stateProvider, $httpProvider, $urlRouterProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/search');
        var patientSearchBackLink = {label: "", state: "search", accessKey: "p", id: "patients-link", icon: "fa-users"};
        var homeBackLink = {label: "", url: "../home/", accessKey: "h", icon: "fa-home"};

        // @if DEBUG='production'
        $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
        $compileProvider.debugInfoEnabled(true);
        // @endif
        $stateProvider.state('search', {
            url: '/search',
            data: {
                backLinks: [homeBackLink]
            },
            views: {
                'content': {
                    templateUrl: '../common/patient-search/views/patientsList.html',
                    controller: 'PatientsListController'
                },
                'additional-header': {
                    templateUrl: '../common/ui-helper/header.html'
                }
            },
            resolve: {
                initialization: 'initialization'
            }
        })
            .state('upload', {
                url: '/patient/:patientUuid/document',
                data: {
                    backLinks: [homeBackLink, patientSearchBackLink]
                },
                views: {
                    'header': {
                        templateUrl: 'views/patientHeader.html'
                    },
                    'content': {
                        templateUrl: 'views/documentUpload.html',
                        controller: 'DocumentController'
                    },
                    'additional-header': {
                        template: '<patient-summary patient="patient"/>'
                    }
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('error', {
                url: '/error',
                views: {
                    'content': {
                        templateUrl: '../common/ui-helper/error.html'
                    }
                }
            });

        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $bahmniTranslateProvider.init({app: 'document-upload', shouldMerge: true});
    }]).run(['backlinkService', function (backlinkService) {
        FastClick.attach(document.body);
        moment.locale(window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en");
        backlinkService.addBackUrl();
    }]);
