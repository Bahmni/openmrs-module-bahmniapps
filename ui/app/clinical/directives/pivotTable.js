angular.module('bahmni.clinical').directive('pivotTable', ['$http','appService','$rootScope',function ($http, appService,$rootScope) {
    return {
        scope:{
            diseaseName:"="
        },
        link:function(scope,element,attrs){
            var diseaseSummaryConfig = appService.getAppDescriptor().getConfigValue("pivotTable")[scope.diseaseName];
            var patientUuid = $rootScope.patient.uuid;
            $http.get(Bahmni.Common.Constants.diseaseSummaryPivotUrl,{
                params: { patientUuid: patientUuid, numberOfVisits: diseaseSummaryConfig["numberOfVisits"], obsConcepts: diseaseSummaryConfig["obsConcepts"], drugConcepts: "", labConcepts: ""}
            }).success(function(data){
                scope.result = data;
            })
        },

        templateUrl: 'views/pivotTable.html'
    }
}]);