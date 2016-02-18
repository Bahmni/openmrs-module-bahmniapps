'use strict';

angular.module('authentication')
    .service('userService', ['$rootScope', '$http', '$q', 'offlineService', function ($rootScope, $http, $q, offlineService) {
        var offlineApp = offlineService.isOfflineApp();

        var getUserFromServer = function(userName) {
            return $http.get(Bahmni.Common.Constants.userUrl, {
                method: "GET",
                params: {
                    username: userName,
                    v: "custom:(username,uuid,person:(uuid,),privileges:(name,retired),userProperties)"
                },
                cache: false
            });
        };

        this.getUser = function (userName) {
            var deferrable = $q.defer(), cachedUserData = offlineService.getItem('userData');
            if(offlineApp && cachedUserData){
                deferrable.resolve(cachedUserData);
            } else{
                getUserFromServer(userName).success(function(data){
                    deferrable.resolve(data);
                    offlineService.setItem('userData', data);
                }).error(function(){
                    deferrable.reject('Unable to get user data');
                });
            }
            return deferrable.promise;
        };

        this.savePreferences = function () {
            var deferrable = $q.defer(), cachedUserProperties = offlineService.getItem('userProperties');
            if(offlineApp && cachedUserProperties){
                $rootScope.currentUser.userProperties = cachedUserProperties;
                deferrable.resolve();
                return deferrable.promise;
            }
            var user = $rootScope.currentUser.toContract();
            $http.post(Bahmni.Common.Constants.userUrl + "/" + user.uuid, {"uuid": user.uuid, "userProperties": user.userProperties}, {
                withCredentials: true
            }).then(function (response) {
                offlineService.setItem('userProperties', response.data.userProperties);
                $rootScope.currentUser.userProperties = response.data.userProperties;
                deferrable.resolve();
            });
            return deferrable.promise;
        };

        var getProviderFromServer = function(uuid) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {
                    user: uuid
                },
                cache: false
            });
        };

        this.getProviderForUser = function (uuid) {
            var deferrable = $q.defer(), cachedProviderData = offlineService.getItem('providerData');
            if(offlineApp && cachedProviderData){
                deferrable.resolve(cachedProviderData);
            } else{
                getProviderFromServer(uuid).success(function(data){
                    offlineService.setItem('providerData', data);
                    deferrable.resolve(data);
                }).error(function(){
                    deferrable.reject('Unable to get provider data');
                });
            }
            return deferrable.promise;
        };

    }]);
