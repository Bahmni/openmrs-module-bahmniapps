'use strict';

describe('FormDraftService', function () {
    var formDraftService;
    var mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'patch', 'delete']);

    beforeEach(function () {
        module('bahmni.common.services');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['formDraftService', function (formDraftServiceInjected) {
            formDraftService = formDraftServiceInjected;
        }]);
    });

    it('should POST to formdraft endpoint with correct payload on saveDraft', function () {
        var patientUuid = 'patient-uuid-123';
        var providerUuid = 'provider-uuid-456';
        var formData = '{"observations":[]}';
        var mockResponse = {data: {uuid: 'draft-uuid', timestamp: 1234567890000, markedAsSaved: true}};
        mockHttp.post.and.returnValue(specUtil.respondWith(mockResponse));

        formDraftService.saveDraft(patientUuid, providerUuid, formData);

        expect(mockHttp.post).toHaveBeenCalledWith(
            '/openmrs/ws/rest/v1/bahmnicore/formdraft',
            {
                patientUuid: patientUuid,
                providerUuid: providerUuid,
                formData: formData
            }
        );
    });

    it('should GET from formdraft endpoint with correct params on getDraft', function () {
        var patientUuid = 'patient-uuid-123';
        var providerUuid = 'provider-uuid-456';
        var mockResponse = {data: {uuid: 'draft-uuid', timestamp: 1234567890000}};
        mockHttp.get.and.returnValue(specUtil.respondWith(mockResponse));

        formDraftService.getDraft(patientUuid, providerUuid);

        expect(mockHttp.get).toHaveBeenCalledWith(
            '/openmrs/ws/rest/v1/bahmnicore/formdraft',
            {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            }
        );
    });

    it('should PATCH to formdraft endpoint with correct params on markDraftAsSaved', function () {
        var patientUuid = 'patient-uuid-123';
        var providerUuid = 'provider-uuid-456';
        var mockResponse = {data: {uuid: 'draft-uuid', timestamp: 1234567890000, markedAsSaved: true}};
        mockHttp.patch.and.returnValue(specUtil.respondWith(mockResponse));

        formDraftService.markDraftAsSaved(patientUuid, providerUuid);

        expect(mockHttp.patch).toHaveBeenCalledWith(
            '/openmrs/ws/rest/v1/bahmnicore/formdraft',
            {},
            {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            }
        );
    });

    it('should DELETE formdraft endpoint with correct params on discardDraft', function () {
        var patientUuid = 'patient-uuid-123';
        var providerUuid = 'provider-uuid-456';
        var mockResponse = {data: {success: true}};
        mockHttp.delete.and.returnValue(specUtil.respondWith(mockResponse));

        formDraftService.discardDraft(patientUuid, providerUuid);

        expect(mockHttp.delete).toHaveBeenCalledWith(
            '/openmrs/ws/rest/v1/bahmnicore/formdraft',
            {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            }
        );
    });
});
