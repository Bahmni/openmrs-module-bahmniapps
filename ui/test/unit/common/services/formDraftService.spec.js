'use strict';

describe('FormDraftService', function () {
    var formDraftService;
    var mockHttp;
    var mockChannel;
    var mockWindow;

    beforeEach(function () {
        mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'patch', 'delete']);
        mockChannel = jasmine.createSpyObj('BroadcastChannel', ['postMessage', 'close']);
        mockWindow = {
            BroadcastChannel: jasmine.createSpy('BroadcastChannel').and.returnValue(mockChannel)
        };

        module('bahmni.common.services');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
            $provide.value('$window', mockWindow);
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

    it('should not make DELETE request when patientUuid is null', function () {
        formDraftService.discardDraft(null, 'provider-uuid-456');
        expect(mockHttp.delete).not.toHaveBeenCalled();
    });

    it('should not make DELETE request when providerUuid is null', function () {
        formDraftService.discardDraft('patient-uuid-123', null);
        expect(mockHttp.delete).not.toHaveBeenCalled();
    });

    it('should not make DELETE request when both uuids are null', function () {
        formDraftService.discardDraft(null, null);
        expect(mockHttp.delete).not.toHaveBeenCalled();
    });

    it('should broadcast drafts-changed after saveDraft succeeds', function (done) {
        var mockResponse = {data: {uuid: 'draft-uuid'}};
        mockHttp.post.and.returnValue(specUtil.respondWith(mockResponse));

        formDraftService.saveDraft('patient-uuid-123', 'provider-uuid-456', '{}').then(function () {
            expect(mockWindow.BroadcastChannel).toHaveBeenCalledWith('bahmni-draft-indicator-update');
            expect(mockChannel.postMessage).toHaveBeenCalledWith({type: 'drafts-changed'});
            expect(mockChannel.close).toHaveBeenCalled();
            done();
        });
    });

    it('should broadcast drafts-changed after discardDraft succeeds', function (done) {
        var mockResponse = {data: {success: true}};
        mockHttp.delete.and.returnValue(specUtil.respondWith(mockResponse));

        formDraftService.discardDraft('patient-uuid-123', 'provider-uuid-456').then(function () {
            expect(mockWindow.BroadcastChannel).toHaveBeenCalledWith('bahmni-draft-indicator-update');
            expect(mockChannel.postMessage).toHaveBeenCalledWith({type: 'drafts-changed'});
            expect(mockChannel.close).toHaveBeenCalled();
            done();
        });
    });

    it('should broadcast drafts-changed after markDraftAsSaved succeeds', function (done) {
        var mockResponse = {data: {uuid: 'draft-uuid', markedAsSaved: true}};
        mockHttp.patch.and.returnValue(specUtil.respondWith(mockResponse));

        formDraftService.markDraftAsSaved('patient-uuid-123', 'provider-uuid-456').then(function () {
            expect(mockWindow.BroadcastChannel).toHaveBeenCalledWith('bahmni-draft-indicator-update');
            expect(mockChannel.postMessage).toHaveBeenCalledWith({type: 'drafts-changed'});
            expect(mockChannel.close).toHaveBeenCalled();
            done();
        });
    });
});
