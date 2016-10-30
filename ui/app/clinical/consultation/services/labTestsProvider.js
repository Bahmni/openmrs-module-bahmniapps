'use strict';

angular.module('bahmni.clinical')
  .service('labTestsProvider', ['$q', 'conceptSetService', function ($q, conceptSetService) {
      this.getTests = function () {
          var deferer = $q.defer();
          var labConceptsPromise = conceptSetService.getConcept({name: Bahmni.Clinical.Constants.labConceptSetName, v: "custom:(uuid,setMembers:(uuid,name,conceptClass,setMembers:(uuid,name,conceptClass,setMembers:(uuid,name,conceptClass))))"}, true);
          var departmentConceptsPromise = conceptSetService.getConcept({name: Bahmni.Clinical.Constants.labDepartmentsConceptSetName, v: "custom:(uuid,setMembers:(uuid,name,setMembers:(uuid,name)))"}, true);
          $q.all([labConceptsPromise, departmentConceptsPromise]).then(function (results) {
              var labConceptsSet = results[0].data.results[0];
              var labDepartmentsSet = results[1].data.results[0];
              var tests = new Bahmni.LabConceptsMapper().map(labConceptsSet, labDepartmentsSet);
              deferer.resolve(tests);
          }, deferer.reject);
          return deferer.promise;
      };
  }]);
