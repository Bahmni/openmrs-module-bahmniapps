angular.module('bahmni.common.uiHelper')
    .directive('onClickOutside',['$document', function ($document) {
        return {
            scope:{
                excludeElement:"@",
                onClickOutside:"="
            },
            link: function(scope,element,attrs){
                var listener = function (event) {
                    if(scope.excludeElement){
                        var partOfExclusion = $(scope.excludeElement).find(event.target);
                        if (partOfExclusion.length > 0) return;
                    }
                    var insideElement = $(element).find(event.target);
                    if (insideElement.length == 0 && !element.is(event.target) ) {
                        scope.$apply(scope.onClickOutside);
                    }
                };
                $document.on('click', listener)
                element.on('$destroy', function() {
                    $document.off("click", listener);
                });
            }
        }
    }]);
