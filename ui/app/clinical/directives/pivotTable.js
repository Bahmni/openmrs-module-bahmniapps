angular.module('bahmni.clinical').directive('pivotTable', ['spinner', '$rootScope','pivotTableService','clinicalAppConfigService',
    function (spinner, $rootScope,pivotTableService,clinicalAppConfigService) {

        var pivotTableConfigFor = function(diseaseName){
            var diseaseTemplateConfigs = clinicalAppConfigService.getDiseaseTemplateConfig();
            var requiredTemplateConfig =_.find(diseaseTemplateConfigs,function(diseaseTemplateConfig){
                return diseaseTemplateConfig.templateName === diseaseName;
            });
            return requiredTemplateConfig ? requiredTemplateConfig["pivotTable"]:null;
        };
        return {
        scope: {
            diseaseName: "=",
            displayName:"="
        },
        link: function (scope, element, attrs) {
            var diseaseSummaryConfig =pivotTableConfigFor(scope.diseaseName);
            if(!diseaseSummaryConfig) return;

            var patientUuid = $rootScope.patient.uuid;

            var pivotDataPromise = pivotTableService.getPivotTableFor(patientUuid,diseaseSummaryConfig);
            spinner.forPromise(pivotDataPromise);
            pivotDataPromise.success(function (data) {
                scope.result = data;
                scope.hasData = !_.isEmpty(scope.result.tabularData);
            })
        },
        templateUrl: 'views/pivotTable.html'
    }
}]);