'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', [function() {
    return {
        scope : {
            targetModel : '=',
            attribute : '='
        },
        templateUrl : '../common/attributeTypes/views/attributeInformation.html',
        restrict : 'E'
    }
}]);