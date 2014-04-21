'use strict';

angular.module('bahmni.common.uiHelper')
    .factory('printer', ['$rootScope', '$compile', '$http', '$timeout', function ($rootScope, $compile, $http, $timeout) {
        var printElement = function (element) {
            var hiddenFrame = $('<iframe style="display: none"></iframe>').appendTo('body')[0];
            hiddenFrame.contentWindow.printAndRemove = function() {
                hiddenFrame.contentWindow.print();
                $(hiddenFrame).remove();
            };
            var emptyBody = "<!doctype html>"+
                        "<html>"+
                            '<body onload="printAndRemove();">' +
                            "</body>"+
                        "</html>";
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write(emptyBody);
            $(element).appendTo($(doc).find('body'));
            doc.close();
        };

        var print = function (templateUrl, data) {
            $http.get(templateUrl).success(function(template){
                var printScope = $rootScope.$new()
                angular.extend(printScope, data);
                var element = $compile($(template))(printScope);
                $timeout(function(){
                    printElement(element);
                });
            });
        };

        return {
            print: print
        }
}]);
