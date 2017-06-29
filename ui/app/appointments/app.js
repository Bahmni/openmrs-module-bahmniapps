'use strict';

angular
    .module('bahmni.appointments')
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
            $urlRouterProvider.otherwise('/home/manage');
            $urlRouterProvider.when('/home', '/home/manage');
        // @if DEBUG='production'
            $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
            $compileProvider.debugInfoEnabled(true);
        // @endif
            $stateProvider
            .state('home', {
                url: '/home',
                abstract: true,
                views: {
                    'additional-header': {
                        templateUrl: 'views/appointmentsHeader.html',
                        controller: 'AppointmentsHeaderController'
                    },
                    'mainContent': {
                        template: '<div class="opd-wrapper appointments-page-wrapper">' +
                        '<div ui-view="content" class="opd-content-wrapper appointments-content-wrapper"></div>' +
                        '</div>'
                    }
                },
                data: {
                    backLinks: []
                }
            }).state('home.manage', {
                url: '/manage',
                views: {
                    'content': {
                        templateUrl: 'views/manageAppointments.html',
                        controller: 'AppointmentsManageController'
                    }
                }
            }).state('home.manage.summary', {
                url: '/summary',
                views: {
                    'summary': {
                        templateUrl: 'views/summary.html',
                        controller: 'AppointmentsManageController'
                    }
                }
            }).state('home.manage.appointments', {
                url: '/appointments',
                views: {
                    'content': {
                        templateUrl: 'views/appointments.html',
                        controller: 'AppointmentsManageController'
                    }
                }
            }).state('home.admin', {
                url: '/admin',
                views: {
                    'content': {
                        templateUrl: 'views/appointmentsAdmin.html',
                        controller: 'AppointmentsAdminController'
                    }
                }
            }).state('home.service', {
                url: '/service/:uuid',
                views: {
                    'content': {
                        templateUrl: 'views/appointmentsService.html',
                        controller: 'AppointmentsServiceController'
                    }
                }
            });

            $bahmniTranslateProvider.init({app: 'appointments', shouldMerge: true});
        }]).run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
            $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        );
        }]);
