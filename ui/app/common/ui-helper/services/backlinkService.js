angular.module('bahmni.common.uiHelper')
    .service('backlinkService', function ($window, $state) {
        var self = this;
        
        var urls = {};
        self.reset = function() {
            urls = {};
        };

        self.setUrls = function(backLinks){
            self.reset();
            angular.forEach(backLinks, function(backLink){
                self.addUrl(backLink);
            });
        };
            
        self.addUrl = function(backLink){
            urls[backLink.label] = backLink.state != null ? goToStateFunction(backLink.state) : goToUrlFunction(backLink.url);
        };

        var goToUrlFunction = function(url) {
            return function() {
                $window.location.href = url;
            };
        };

        var goToStateFunction = function(state) {
            return function() {
                $state.go(state);
            }
        };

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
