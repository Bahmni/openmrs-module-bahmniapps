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
                            }).success(function (response) {
                                if (response.status == 200) {
                                    eventQueue.removeFromQueue(event);
                                }
                                consume();
                            }).catch(function (response) {
                                if(response.status == -1){
                                    eventQueue.releaseFromQueue(event);
                                }
                                else{
                                    console.log("Push error. Status Code:" + response.status);
                                }
                            })
                        });
                    });
                }

                if(offlineService.isOfflineApp()) {
                        consume();
                    }
                }
        }
    ]);
