'use strict';

angular.module('opd.consultation')
  .service('otherTestsProvider', ['$q', 'conceptSetService', 'appService',function ($q, conceptSetService, appService) {
    var orderTypesMapConfig = appService.getAppDescriptor().getConfig("otherInvestigationsMap");
    var orderTypesMap = orderTypesMapConfig ? orderTypesMapConfig.value : {};
    var mapper = new Bahmni.Opd.OtherInvestigationsConceptsMapper(orderTypesMap);

  	this.getTests = function() {
	  	var deferer = $q.defer();
        var otherInvestigationsConceptPromise = conceptSetService.getConceptSetMembers({name: Bahmni.Opd.Consultation.Constants.otherInvestigationsConceptSetName, v: "fullchildren"}, true);
        var categoriesConceptPromise = conceptSetService.getConceptSetMembers({name: Bahmni.Opd.Consultation.Constants.otherInvestigationCategoriesConceptSetName, v: "custom:(uuid,setMembers:(uuid,name,setMembers:(uuid,name)))"}, true);
        $q.all([otherInvestigationsConceptPromise, categoriesConceptPromise]).then(function(results){
            var otherInvestigationConcept = results[0].data.results[0];
            var labDepartmentsSet = results[1].data.results[0];
            var tests = mapper.map(otherInvestigationConcept, labDepartmentsSet);           
            deferer.resolve(tests);
        }, deferer.reject);
  		return deferer.promise;
  	}
}]);