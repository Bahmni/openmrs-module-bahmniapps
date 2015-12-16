angular.module('bahmni.common.uiHelper')
    .directive('focusOnInputErrors', function () {
        return function (scope, elem) {
            scope.$on("event:errorsOnForm", function () {
                var isTopElement = true;
                $("*", elem).each(function(){
                    if($(this).hasClass('illegalValue') && isTopElement)
                    {
                        $(this).focus();
                        isTopElement = false;
                    }
                });
            });
        };
    });
