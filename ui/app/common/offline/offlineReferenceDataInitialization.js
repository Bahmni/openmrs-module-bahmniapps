'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineReferenceDataInitialization', ['offlineService','$http', 'offlineDbService', 'androidDbService', '$q', 'referenceDataDbService',
        function (offlineService, $http, offlineDbService, androidDbService, $q, referenceDataDbService) {
            return function (offlineDb, isAuthenticated) {
                referenceDataDbService.init(offlineDb);
                if(offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var referenceDataMap;
                    referenceDataMap = isAuthenticated ?
                                                Bahmni.Common.Constants.authenticatedReferenceDataMap :
                                                Bahmni.Common.Constants.unAuthenticatedReferenceDataMap;
                    angular.forEach(referenceDataMap, function(referenceData, url){

                       offlineDbService.getReferenceData(referenceData).then(function(result){
                            var requestUrl = Bahmni.Common.Constants.hostURL + url;
                            var req = {
                                method: 'GET',
                                url: requestUrl,
                                headers: {
                                    'If-None-Match': result ? result.etag : undefined
                                }
                            };
                            if(referenceData == 'LocaleList') {
                                req.headers.Accept = 'text/plain';
                            }
                            return $http(req).then(function (response) {
                                if(response.status == 200) {
                                    var eTag = response.headers().etag;
                                    return offlineDbService.insertReferenceData(referenceData, response.data, eTag);
                                }
                            }).catch(function(result){
                                if(result.status == 304) {
                                    return $q.when({});
                                }
                            });
                        });
                    })
                }
            };
        }
    ]);
