'use strict';

angular
    .module('bahmni.appointments')
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
            $urlRouterProvider.otherwise('/home/manage/summary');
            $urlRouterProvider.when('/home/manage', '/home/manage/summary');
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
                },
                resolve: {
                    initializeConfig: function (initialization, $stateParams) {
                        return initialization($stateParams.appName);
                    }
                }
            }).state('home.manage', {
                url: '/manage',
                views: {
                    'content': {
                        templateUrl: 'views/appointmentsManage.html',
                        controller: 'AppointmentsManageController'
                    }
                }
            }).state('home.manage.summary', {
                url: '/summary',
                views: {
                    'content@manage': {
                        templateUrl: 'views/summary.html'
                    }
                }
            }).state('home.manage.appointments', {
                url: '/appointments',
                views: {
                    'content@manage': {
                        templateUrl: 'views/allAppointments.html'
                    }
                }
            }).state('home.manage.appointments.new', {
                url: '/new',
                views: {
                    'content@appointment': {
                        templateUrl: 'views/appointmentsManageNew.html'
                    }
                }
            }).state('home.manage.appointments.edit', {
                url: '/:uuid',
                views: {
                    'content@appointment': {
                        templateUrl: 'views/appointmentsManageEdit.html'
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
