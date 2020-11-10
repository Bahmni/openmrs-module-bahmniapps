angular.module('bahmni.clinical')
    .directive("draggableDiv", ['$document', function ($document) {
        return {
            link: function (scope, element, attr) {
                element.resizable({ handles: " n, e, s, w, ne, se, sw, nw" });
                element.draggable();
            }
        };
    }]);
