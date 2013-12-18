'use strict';

angular.module('opd.consultation.services')
  .service('labTestsProvider', ['$q', 'conceptSetService', function ($q, conceptSetService) {

  	this.getTests = function() {
	  	var deferer = $q.defer();
        var labConceptsPromise = conceptSetService.getConceptSetMembers({name: 'Laboratory', v: "fullchildren"}, true);
        var departmentConceptsPromise = conceptSetService.getConceptSetMembers({name: 'Lab Departments', v: "custom:(uuid,setMembers:(uuid,name,setMembers:(uuid,name)))"}, true);
        $q.all([labConceptsPromise, departmentConceptsPromise]).then(function(results){
            var labConceptsSet = results[0].data.results[0];
            var labDepartmentsSet = results[1].data.results[0];
            var tests = new Bahmni.Opd.LabConceptsMapper().map(labConceptsSet, labDepartmentsSet);           
            deferer.resolve(tests);
        }, deferer.reject);
  		return deferer.promise;
  	}
}]);