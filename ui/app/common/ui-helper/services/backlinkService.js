angular.module('bahmni.common.uiHelper')
    .service('backlinkService', function ($location, $window) {
        var self = this;
        
        var urls = {};
        self.reset = function() {
            urls = {};
        };

        self.setUrls = function(backLinks){
            self.reset();
            angular.forEach(backLinks, function(backLink){
                self.addUrl(backLink.label, backLink.url);                
            });
        };
            
        self.addUrl = function(label, url){
            urls[label] = goToUrlFunction(url);
        };

        var goToUrlFunction = function(url) {
            return function() {
                $window.location.href = url;
            };
        }

        self.addBackUrl = function(label) {
            var backLabel = label || "Back";
            urls[backLabel] =  function() {
              $window.history.back();  
            } 
        };

        self.getUrlByLabel = function(label){
            return urls[label];
        };

        self.getAllUrls= function(){
            return urls;
        }
    });
