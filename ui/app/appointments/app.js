'use strict';

angular
    .module('bahmni.appointments')
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
            $urlRouterProvider.otherwise('/appointments/manage');
            $urlRouterProvider.when('/appointments', '/appointments/manage');
        // @if DEBUG='production'
            $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
            $compileProvider.debugInfoEnabled(true);
        // @endif
            $stateProvider
            .state('appointments', {
                url: '/appointments',
                abstract: true,
                views: {
                    'additional-header': {
                        templateUrl: 'views/appointmentsHeader.html',
                        controller: 'AppointmentsHeaderController'
                    },
                    'mainContent': {
                        template: '<div class="opd-wrapper">' +
                        '<div ui-view="content" class="opd-content-wrapper"></div>' +
                        '</div>'
                    }
                }
            }).state('appointments.manage', {
                url: '/manage?args',
                views: {
                    'content': {
                        templateUrl: 'views/manageAppointments.html',
                        controller: 'ManageAppointmentsController'
                    }
                }
            }).state('appointments.admin', {
                url: '/admin?args',
                views: {
                    'content': {
                        templateUrl: 'views/appointmentsAdmin.html',
                        controller: 'AppointmentsAdminController'
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
