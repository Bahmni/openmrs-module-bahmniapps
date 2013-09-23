'use strict';

angular.module('infrastructure.httpErrorInterceptor', ['registration.patient.models'])
    .config(function($httpProvider) {
        var interceptor = ['$rootScope', '$q', '$window', 'errorCode', function($rootScope, $q, $window, errorCode) {
            var showError = function(errorMessage){
                $rootScope.server_error = errorMessage;
                $window.scrollTo(0, 0)
            };

            function stringAfter(value, searchString) {
                var indexOfFirstColon = value.indexOf(searchString);
                return value.substr(indexOfFirstColon + 1).trim()
            }

           function success(response) {
                $rootScope.server_error = null;
                return response;
           }

           function error(response) {
               var data = response.data;
               var unexpecetedError = "There was an unexpected issue on the server. Please try again";
               if (response.status === 500 && !errorCode.isOpenERPError(data)) {
                    var errorMessage = data.error && data.error.message ? stringAfter(data.error.message, ':') : unexpecetedError;
                    showError(errorMessage);
               }
               if (response.status === 409){
                   var errorMessage = data.error && data.error.message ? stringAfter(data.error.message, ':') : "Duplicate entry error";
                   showError(errorMessage);
               }
               else if(response.status === 0){
                  showError("Could not connect to the server. Please check your connection and try again");
               }
               else if(response.status === 405){
                  showError(unexpecetedError);
               }
               else if(response.status === 400){
                   if($rootScope.server_error === null){
                   showError("Could not connect to the server. Please check your connection and try again");
                   }
               }
               return $q.reject(response);
           }

           return function(promise) {
                return promise.then(success, error);
           }

        }];
        $httpProvider.responseInterceptors.push(interceptor);
    }).run(['$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.$watch(function(){
            return $location.path();
        }, function () {
            $rootScope.server_error = null;
        })
    }]);