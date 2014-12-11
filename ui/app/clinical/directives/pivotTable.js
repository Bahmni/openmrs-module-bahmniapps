angular.module('bahmni.clinical').directive('pivotTable', ['spinner', 'appService', '$rootScope','pivotTableService', function (spinner, appService, $rootScope,pivotTableService) {
    return {
        scope: {
            diseaseName: "="
        },
        link: function (scope, element, attrs) {
            var diseaseSummaryConfig = appService.getAppDescriptor().getConfigValue("pivotTable")[scope.diseaseName];

            if(!diseaseSummaryConfig) return;

            var patientUuid = $rootScope.patient.uuid;

            var pivotDataPromise = pivotTableService.getPivotTableForDisease(patientUuid,diseaseSummaryConfig)
            spinner.forPromise(pivotDataPromise);
            pivotDataPromise.success(function (data) {
                scope.result = data;
                if (!_.isEmpty(scope.result.tabularData)) {
                    scope.hasData = true;
                }
                else {
                    scope.hasData = false;
                }
            })

        },

        templateUrl: 'views/pivotTable.html'
    }
}]);