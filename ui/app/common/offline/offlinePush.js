'use strict';

angular.module('bahmni.common.offline')
    .factory('offlinePush', ['offlineService','eventQueue','$http','offlineDbService','androidDbService',
        function (offlineService, eventQueue, $http, offlineDbService, androidDbService) {
            return function () {
                function consume() {
                    if(offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    eventQueue.consumeFromEventQueue().then(function (event) {
                        if (!event)
                            return null;
                        offlineDbService.getPatientByUuid(event.data.patientUuid).then(function(response){
                           response.relationships = [];
                           $http.post(event.data.url, response, {
                               withCredentials: true,
                               headers: {
                                   "Accept": "application/json",
                                   "Content-Type": "application/json"
                               }
                           }).then(function (response) {
                               if (response.status == 200) {
                                   eventQueue.removeFromQueue(event);
                               }
                               consume();
                           }).then(function (error) {
                               console.log(error);
                           });
                        });
                    });
                }

                if(offlineService.isOfflineApp()) {
                        consume();
                    }
                }
        }
    ]);
