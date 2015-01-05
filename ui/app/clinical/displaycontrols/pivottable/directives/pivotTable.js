'use strict';
angular.module('bahmni.clinical').directive('pivotTable', ['spinner','pivotTableService','clinicalAppConfigService',
    function (spinner,pivotTableService,clinicalAppConfigService) {

        var pivotTableConfigFor = function(diseaseName){
            var diseaseTemplateConfigs = clinicalAppConfigService.getDiseaseTemplateConfig();
            var requiredTemplateConfig =_.find(diseaseTemplateConfigs,function(diseaseTemplateConfig){
                return diseaseTemplateConfig.templateName === diseaseName;
            });
            return requiredTemplateConfig ? requiredTemplateConfig["pivotTable"]:null;
        };
        return {
        scope: {
            patientUuid: "=",
            diseaseName: "=",
            displayName: "="
        },
            link: function (scope) {
                var diseaseSummaryConfig =pivotTableConfigFor(scope.diseaseName);
            if(!diseaseSummaryConfig) return;

            var patientUuid = scope.patientUuid;

            var pivotDataPromise = pivotTableService.getPivotTableFor(patientUuid,diseaseSummaryConfig);
            spinner.forPromise(pivotDataPromise);
            pivotDataPromise.success(function (data) {
                scope.result = data;
                scope.hasData = !_.isEmpty(scope.result.tabularData);
            })
        },
        templateUrl: 'displaycontrols/pivottable/views/pivotTable.html'
    }
}]);