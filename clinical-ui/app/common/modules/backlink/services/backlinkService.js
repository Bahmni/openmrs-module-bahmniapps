angular.module('bahmni.common.backlink', [])
    .service('backlinkService', function () {

        var urls = {};
        this.addUrl = function(label, url){
            urls[label] = url;
        }  ;

        this.getUrlByLabel = function(label){
            return urls[label];
        } ;

        this.getAllUrls= function(){
            return urls;
        }
    });
