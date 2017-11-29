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
                        templateUrl: 'views/manage/appointmentsManage.html',
                        controller: 'AppointmentsManageController'
                    }
                }
            }).state('home.manage.summary', {
                url: '/summary',
                tabName: 'summary',
                params: {
                    viewDate: null
                },
                views: {
                    'content@manage': {
                        templateUrl: 'views/manage/appointmentsSummary.html',
                        controller: 'AppointmentsSummaryController'
                    }
                }
            }).state('home.manage.appointments', {
                url: '/appointments',
                params: {
                    filterParams: {},
                    isFilterOpen: true,
                    isSearchEnabled: false
                },
                views: {
                    'filter': {
                        templateUrl: 'views/manage/appointmentFilter.html',
                        controller: 'AppointmentsFilterController'
                    },
                    'content@manage': {
                        templateUrl: 'views/manage/allAppointments.html',
                        controller: 'AllAppointmentsController'
                    }

                }
            }).state('home.manage.appointments.calendar', {
                url: '/calendar',
                tabName: 'calendar',
                params: {
                    viewDate: null
                },
                views: {
                    'content@viewAppointments': {
                        templateUrl: 'views/manage/calendar/calendarView.html',
                        controller: 'AppointmentsCalendarViewController'
                    }
                },
                resolve: {
                    appointmentsContext: function (appointmentsInitialization) {
                        return appointmentsInitialization();
                    }
                }
            }).state('home.manage.appointments.calendar.new', {
                url: '/new',
                params: {
                    appointment: null
                },
                views: {
                    'content@appointment': {
                        templateUrl: 'views/manage/newAppointment.html',
                        controller: 'AppointmentsCreateController'
                    }
                },
                resolve: {
                    appointmentContext: function (appointmentInitialization, $stateParams) {
                        return appointmentInitialization($stateParams);
                    },
                    appointmentCreateConfig: function (initializeConfig, appointmentConfigInitialization, appointmentContext) {
                        return appointmentConfigInitialization(appointmentContext);
                    }
                }
            }).state('home.manage.appointments.calendar.edit', {
                url: '/:uuid',
                views: {
                    'content@appointment': {
                        templateUrl: 'views/manage/newAppointment.html',
                        controller: 'AppointmentsCreateController'
                    }
                },
                resolve: {
                    appointmentContext: function (appointmentInitialization, $stateParams) {
                        return appointmentInitialization($stateParams);
                    },
                    appointmentCreateConfig: function (initializeConfig, appointmentConfigInitialization, appointmentContext) {
                        return appointmentConfigInitialization(appointmentContext);
                    }
                }
            }).state('home.manage.appointments.list', {
                url: '/list',
                tabName: 'list',
                params: {
                    viewDate: null,
                    patient: null
                },
                views: {
                    'content@viewAppointments': {
                        templateUrl: 'views/manage/list/listView.html',
                        controller: 'AppointmentsListViewController'
                    }
                }
            }).state('home.manage.appointments.list.new', {
                url: '/new',
                views: {
                    'content@appointment': {
                        templateUrl: 'views/manage/newAppointment.html',
                        controller: 'AppointmentsCreateController'
                    }
                },
                resolve: {
                    appointmentContext: function (appointmentInitialization, $stateParams) {
                        return appointmentInitialization($stateParams);
                    },
                    appointmentCreateConfig: function (initializeConfig, appointmentConfigInitialization, appointmentContext) {
                        return appointmentConfigInitialization(appointmentContext);
                    }
                }
            }).state('home.manage.appointments.list.edit', {
                url: '/:uuid',
                views: {
                    'content@appointment': {
                        templateUrl: 'views/manage/newAppointment.html',
                        controller: 'AppointmentsCreateController'
                    }
                },
                resolve: {
                    appointmentContext: function (appointmentInitialization, $stateParams) {
                        return appointmentInitialization($stateParams);
                    },
                    appointmentCreateConfig: function (initializeConfig, appointmentConfigInitialization, appointmentContext) {
                        return appointmentConfigInitialization(appointmentContext);
                    }
                }
            }).state('home.admin', {
                url: '/admin',
                abstract: true,
                views: {
                    'content': {
                        templateUrl: 'views/admin/appointmentsAdmin.html'
                    }
                }
            }).state('home.admin.service', {
                url: '/service',
                views: {
                    'content@admin': {
                        templateUrl: 'views/admin/allAppointmentServices.html',
                        controller: 'AllAppointmentServicesController'
                    }
                }
            }).state('home.admin.service.edit', {
                url: '/:uuid',
                views: {
                    'content@admin': {
                        templateUrl: 'views/admin/appointmentService.html',
                        controller: 'AppointmentServiceController'
                    }
                },
                resolve: {
                    appointmentServiceContext: function (appointmentServiceInitialization, $stateParams) {
                        return appointmentServiceInitialization($stateParams.uuid);
                    }
                }
            });

            $bahmniTranslateProvider.init({app: 'appointments', shouldMerge: true});
        }]).run(function () {
            moment.locale(window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en");
        });
