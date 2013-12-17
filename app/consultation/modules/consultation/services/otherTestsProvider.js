'use strict';

angular.module('opd.consultation.services')
  .service('otherTestsProvider', ['$q', 'conceptSetService', function ($q, conceptSetService) {

  	this.getTests = function() {
	  	var deferer = $q.defer();
        var otherInvestigationsConceptPromise = conceptSetService.getConceptSetMembers({name: 'Other Investigations', v: "fullchildren"}, true);
        var categoriesConceptPromise = conceptSetService.getConceptSetMembers({name: 'Other Investigations Categories', v: "custom:(uuid,setMembers:(uuid,name,setMembers:(uuid,name)))"}, true);
        $q.all([otherInvestigationsConceptPromise, categoriesConceptPromise]).then(function(results){
            var otherInvestigationConcept = results[0].data.results[0];
            var labDepartmentsSet = results[1].data.results[0];
            var labEntities = new Bahmni.Opd.OtherInvestigationsConceptsMapper().map(otherInvestigationConcept, labDepartmentsSet);           
            deferer.resolve(labEntities.tests);
        }, deferer.reject);
  		return deferer.promise;
  	}
}]);