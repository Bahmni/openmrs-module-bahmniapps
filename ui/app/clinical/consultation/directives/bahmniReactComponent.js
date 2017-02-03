'use strict';

angular.module('bahmni.clinical')
    .directive('bahmniReactComponent', ['$injector','clinicalAppConfigService', 'reactDirective',function ($injector,clinicalAppConfigService,reactDirective) {
        return {
            restrict: 'E',
            replace: true,
            link: function(scope,element,attrs){
                var onObservationUpdated = function(obs,err){
                    console.log("in onValueChanged",obs,err);
                };

                scope.props = JSON.parse(attrs.props);

                _.forEach(_.keys(scope.props), function(key){ attrs[key] = 'props.'+ key });

                return reactDirective(window.componentStore.componentList[attrs.name],undefined,{},{ onValueChanged: onObservationUpdated }).link(scope,element,attrs);
            }
        }
    }]);
