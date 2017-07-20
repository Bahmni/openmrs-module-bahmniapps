'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsCalendarViewController', ['$scope', '$location',
        function ($scope, $location) {
            var init = function () {
                var date = new Date();
                var d = date.getDate();
                var m = date.getMonth();
                var y = date.getFullYear();

                $scope.providerAppointments = {
                    resources: [
                        {id: 'Ali', title: 'Dr Ali'},
                        {id: 'Bilal', title: 'Dr Bilal', eventColor: 'orange'},
                        {id: 'Sultan', title: 'Dr Sultan'},
                        {id: 'Ashraf', title: 'Dr Ashraf', eventColor: 'grey'},
                        {id: 'Safia', title: 'Dr Safia', eventColor: 'green'},
                        {id: 'Firoz', title: 'Dr Firoz', eventColor: 'brown'},
                        {id: '1', title: '[No Provider]', eventColor: 'grey'}
                    ],
                    events: [
                        {
                            id: 999,
                            title: 'patient 1',
                            start: new Date(y, m, d, 7, 0),
                            resourceId: 'Ali',
                            allDay: false,
                            color: 'red'
                        },
                        {
                            id: 999,
                            title: 'patient 2',
                            start: new Date(y, m, d, 9, 0),
                            end: new Date(y, m, d, 9, 10),
                            resourceId: 'Ali',
                            allDay: false
                        },
                        {
                            id: 999,
                            title: 'patient 3',
                            start: new Date(y, m, d, 9, 0),
                            resourceId: 'Ali',
                            allDay: false
                        },
                        {
                            id: 999,
                            title: 'patient 4',
                            start: new Date(y, m, d, 10, 0),
                            resourceId: 'Ali',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient 8',
                            start: new Date(y, m, d, 15, 0),
                            resourceId: 'Ali',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient 11',
                            start: new Date(y, m, d, 8, 0),
                            resourceId: 'Bilal',
                            allDay: false
                        },
                        {
                            id: 999,
                            title: 'patient 15',
                            start: new Date(y, m, d, 8, 0),
                            resourceId: 'Bilal',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient 17',
                            start: new Date(y, m, d, 14, 0),
                            resourceId: '1',
                            allDay: false
                        },
                        {
                            id: 999,
                            title: 'patient 18',
                            start: new Date(y, m, d, 15, 0),
                            resourceId: 'Bilal',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 8, 0),
                            resourceId: 'Sultan',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 15, 0),
                            resourceId: 'Sultan',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 9, 0),
                            resourceId: 'Ashraf',
                            allDay: false
                        },
                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 9, 0),
                            resourceId: 'Ashraf',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 15, 0),
                            resourceId: '1',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 8, 0),
                            resourceId: 'Safia',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 12, 0),
                            resourceId: 'Safia',
                            allDay: false
                        },
                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 14, 0),
                            resourceId: 'Safia',
                            allDay: false
                        },
                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 15, 0),
                            resourceId: '1',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 8, 0),
                            resourceId: 'Firoz',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 15, 0),
                            resourceId: 'Firoz',
                            allDay: false
                        },

                        {
                            id: 999,
                            title: 'patient ',
                            start: new Date(y, m, d, 7, 0),
                            end: new Date(y, m, d, 17, 0),
                            resourceId: '1',
                            allDay: false
                        }
                    ]
                };
            };
            return init();
        }]);
