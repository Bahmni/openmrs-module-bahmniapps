'use strict';

angular.module('bahmni.common.domain')
    .factory('providerTypeService', ['$http', 'providerService', function ($http, providerService) {
        var getProviderType = function (providerAttributes, providerTypeBasedFormsAccess) {
            var keys = Object.keys(providerTypeBasedFormsAccess);
            return _.filter(_.map(providerAttributes, function (providerAttribute) {
                if (_.includes(keys, providerAttribute.attributeType.display)) {
                    if (providerAttribute.value && providerAttribute.voided === false) {
                        return providerAttribute.attributeType.display;
                    }
                }
            }));
        };

        return {
            getProviderType: getProviderType
        };
    }]);
