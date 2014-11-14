'use strict';

angular
    .module('registration', ['ui.router', 'bahmni.registration', 'authentication', 'bahmni.common.appFramework', 'httpErrorInterceptor', 'bahmni.common.photoCapture', 'bahmni.common.obs'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', function ($urlRouterProvider, $stateProvider, $httpProvider) {
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $urlRouterProvider.otherwise('/search');
        $stateProvider
            .state('search', {
                url: '/search',
                reloadOnSearch: false,
                views: {
                    'content': { templateUrl: 'views/search.html', controller: 'SearchPatientController'}
                },
                resolve: { initialization: 'initialization' }
            })
            .state('newpatient', {
                url: '/patient/new',
                views: {
                    'content': { templateUrl: 'views/newpatient.html', controller: 'CreatePatientController'}
                },
                resolve: { initialization: 'initialization' }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                abstract: true,
                views: {
                    'content': { template: '<div ui-view="content"></div>' }
                },
                resolve: { initialization: 'initialization' }
            })
            .state('patient.edit', {
                url: '?serverError',
                views: {
                    'content': { templateUrl: 'views/editpatient.html', controller: 'EditPatientController'}
                }
            })
            .state('patient.visit', {
                url: '/visit',
                views: {
                    'content': { templateUrl: 'views/visit.html', controller: 'VisitController'}
                }
            })
            .state('patient.print', {
                url: '/print',
                views: {
                    'content': { templateUrl: 'views/print.html', controller: 'PrintController'}
                }
            })
            .state('patient.printSticker', {
                url: '/printSticker',
                views: {
                    'content': { templateUrl: 'views/notimplemented.html'}
                }
            });
    }]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });