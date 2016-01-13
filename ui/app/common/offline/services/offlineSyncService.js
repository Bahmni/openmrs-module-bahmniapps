'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSyncService', ['eventLogService', 'offlinePatientDao',
        function (eventLogService, offlinePatientDao) {

            var sync = function () {
                //todo: Hemanth|Santhosh get catchment number from login location
                eventLogService.getEventsFor(202020).then(function (response) {
                    console.log(response);
                    readEvent(response.data, 0);
                });
            };


            var readEvent = function (events, index) {
                if (events.length == index)
                    return;

                var event = events[index];
                eventLogService.getDataForUrl(event.object).then(function (response) {
                    switch (event.category) {
                        case 'patient':
                            offlinePatientDao.createPatient({patient: response.data});
                            break;
                        case 'Encounter':
                            break;
                    }
                    readEvent(events, ++index);
                });
            };

            return {
                sync: sync
            }
        }
    ]);