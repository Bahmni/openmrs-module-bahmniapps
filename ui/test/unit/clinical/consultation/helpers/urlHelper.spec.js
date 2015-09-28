'use strict';

describe("url helper", function () {

	var urlHelper, 
		stateParams = {patientUuid: "12345"},
		visitUuid = 1;

    beforeEach(function() {
        module('bahmni.clinical');

        module(function ($provide) {
            $provide.value('$stateParams', stateParams);
        });

        inject(['urlHelper', function (urlHelperInjected) {
            urlHelper = urlHelperInjected;
        }]);

    });

    it("should return patient url", function(){
    	var patientUrl = urlHelper.getPatientUrl();
    	var expectedUrl = '/patient/{0}/dashboard'.format(stateParams.patientUuid);
    	expect(patientUrl).toBe(expectedUrl);
    });

    it("should return consultation url", function(){
    	var consultationUrl = urlHelper.getConsultationUrl();
    	var expectedUrl = '/patient/{0}/dashboard/consultation'.format(stateParams.patientUuid);
    	expect(consultationUrl).toBe(expectedUrl);
    });

    it("should return visit url", function(){
    	var visitUrl = urlHelper.getVisitUrl(visitUuid);
    	var expectedUrl = '/patient/{0}/dashboard/visit/{1}'.format(stateParams.patientUuid, visitUuid);
    	expect(visitUrl).toBe(expectedUrl);
    });

});