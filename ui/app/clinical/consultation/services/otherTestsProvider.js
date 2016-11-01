'use strict';

angular.module('bahmni.clinical')
    .service('otherTestsProvider', ['$q', 'conceptSetService', 'clinicalAppConfigService', function ($q, conceptSetService, clinicalAppConfigService) {
        var orderTypesMapConfig = clinicalAppConfigService.getOtherInvestigationsMap();
        var orderTypesMap = orderTypesMapConfig ? orderTypesMapConfig.value : {};
        var mapper = new Bahmni.OtherInvestigationsConceptsMapper(orderTypesMap);

        this.getTests = function () {
            var deferer = $q.defer();
            var otherInvestigationsConceptPromise = conceptSetService.getConcept({name: Bahmni.Clinical.Constants.otherInvestigationsConceptSetName, v: "fullchildren"}, true);
            var categoriesConceptPromise = conceptSetService.getConcept({name: Bahmni.Clinical.Constants.otherInvestigationCategoriesConceptSetName, v: "custom:(uuid,setMembers:(uuid,name,setMembers:(uuid,name)))"}, true);
            $q.all([otherInvestigationsConceptPromise, categoriesConceptPromise]).then(function (results) {
                var otherInvestigationConcept = results[0].data.results[0];
                var labDepartmentsSet = results[1].data.results[0];
                var tests = mapper.map(otherInvestigationConcept, labDepartmentsSet);
                deferer.resolve(tests);
            }, deferer.reject);
            return deferer.promise;
        };
    }]);
