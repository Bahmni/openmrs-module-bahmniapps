'use strict';

angular.module('bahmni.clinical').factory('componentInitialization',
    ['$rootScope','clinicalAppConfigService',
        function ($rootScope,clinicalAppConfigService) {
            return function ($stateParams,consultation) {
                var appExtensions = clinicalAppConfigService.getAllConsultationBoards();
                //This has to be made generic!!!
                var componentExtn = _.find(appExtensions,function(extn){ return extn.id === 'bahmni.clinical.patients.customform'});

                var props = {};
                if(componentExtn && componentExtn.extensionParams && componentExtn.extensionParams.framework === 'react'){
                    props = componentExtn.extensionParams.props || {};
                }
                props.encounterTransaction = consultation;

                return new Bahmni.Clinical.ComponentContext($stateParams.componentName,props);
            };
        }]
);
