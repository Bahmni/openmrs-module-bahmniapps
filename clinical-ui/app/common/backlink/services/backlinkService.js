angular.module('bahmni.common.backlink', [])
    .service('backlinkService', function ($location, $window) {

        var urls = {};
        this.addUrl = function(label, url){
            urls[label] = goToUrlFunction(url);
        };

        var goToUrlFunction = function(url) {
            return function() {
                $window.location.href = url;
            };
        }

        this.addBackUrl = function(label) {
            urls[label || "Back"] =  function() {
              $window.history.back();  
            } 
        };

        this.getUrlByLabel = function(label){
            return urls[label];
        };

        this.getAllUrls= function(){
            return urls;
        }
    });
