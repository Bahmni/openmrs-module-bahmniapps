'use strict';

describe('FormDraftService', function () {
    var formDraftService;
    var mockHttp;
    var mockChannel;
    var mockWindow;
    var $rootScope;
    var $q;

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
        inject(['formDraftService', '$rootScope', '$q', function (formDraftServiceInjected, _$rootScope_, _$q_) {
            formDraftService = formDraftServiceInjected;
            $rootScope = _$rootScope_;
            $q = _$q_;
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

    describe('hasDraftsForProvider', function () {
        it('should GET the formdraft list endpoint with providerUuid and resolve true when drafts exist', function (done) {
            var providerUuid = 'provider-uuid-456';
            var mockResponse = {data: [{uuid: 'draft-uuid'}]};
            mockHttp.get.and.returnValue(specUtil.respondWith(mockResponse));

            formDraftService.hasDraftsForProvider(providerUuid).then(function (hasDrafts) {
                expect(mockHttp.get).toHaveBeenCalledWith(
                    '/openmrs/ws/rest/v1/bahmnicore/formdraft/list',
                    {
                        params: {
                            providerUuid: providerUuid
                        },
                        suppressError: true
                    }
                );
                expect(hasDrafts).toBe(true);
                done();
            });
        });

        it('should resolve false when no drafts exist for the provider', function (done) {
            var mockResponse = {data: []};
            mockHttp.get.and.returnValue(specUtil.respondWith(mockResponse));

            formDraftService.hasDraftsForProvider('provider-uuid-456').then(function (hasDrafts) {
                expect(hasDrafts).toBe(false);
                done();
            });
        });

        it('should resolve false without making a request when providerUuid is not provided', function (done) {
            formDraftService.hasDraftsForProvider(null).then(function (hasDrafts) {
                expect(hasDrafts).toBe(false);
                expect(mockHttp.get).not.toHaveBeenCalled();
                done();
            });
            $rootScope.$digest();
        });
    });

    describe('parseDraftObs', function () {
        it('should parse single-serialized formData correctly', function () {
            var obs = [{concept: {uuid: 'test-uuid'}, value: 'test-value'}];
            var draftData = {uuid: 'draft-uuid', markedAsSaved: false, formData: angular.toJson(obs)};

            var result = formDraftService.parseDraftObs(draftData);
            expect(result.length).toBe(1);
            expect(result[0].concept.uuid).toBe('test-uuid');
        });

        it('should parse double-serialized formData correctly', function () {
            var obs = [{concept: {uuid: 'test-uuid'}, value: 'double-serialized'}];
            var singleSerialized = angular.toJson(obs);
            var doubleSerialized = angular.toJson(singleSerialized);
            var draftData = {uuid: 'draft-uuid', markedAsSaved: false, formData: doubleSerialized};

            var result = formDraftService.parseDraftObs(draftData);
            expect(result.length).toBe(1);
            expect(result[0].concept.uuid).toBe('test-uuid');
            expect(result[0].value).toBe('double-serialized');
        });

        it('should return empty array when draftData is null', function () {
            expect(formDraftService.parseDraftObs(null)).toEqual([]);
        });

        it('should return empty array when draftData has no uuid', function () {
            var draftData = {formData: angular.toJson([{concept: {uuid: 'test'}}])};
            expect(formDraftService.parseDraftObs(draftData)).toEqual([]);
        });

        it('should return empty array when draftData is markedAsSaved', function () {
            var draftData = {uuid: 'draft-uuid', markedAsSaved: true, formData: angular.toJson([{concept: {uuid: 'test'}}])};
            expect(formDraftService.parseDraftObs(draftData)).toEqual([]);
        });

        it('should return empty array when formData is invalid JSON', function () {
            var draftData = {uuid: 'draft-uuid', markedAsSaved: false, formData: 'not-valid-json{{{'};
            expect(formDraftService.parseDraftObs(draftData)).toEqual([]);
        });

        it('should return empty array when formData parses to a non-array', function () {
            var draftData = {uuid: 'draft-uuid', markedAsSaved: false, formData: angular.toJson({concept: 'x'})};
            expect(formDraftService.parseDraftObs(draftData)).toEqual([]);
        });
    });

    describe('in-flight request sharing', function () {
        it('should issue one GET when two callers ask for the same draft concurrently', function () {
            mockHttp.get.and.returnValue(specUtil.respondWithPromise($q, {data: {uuid: 'draft-uuid'}}));

            var first = formDraftService.getDraft('patient-1', 'provider-1');
            var second = formDraftService.getDraft('patient-1', 'provider-1');

            expect(mockHttp.get.calls.count()).toBe(1);
            expect(first).toBe(second);
        });

        it('should issue a separate GET for a different patient', function () {
            mockHttp.get.and.returnValue(specUtil.respondWithPromise($q, {data: {uuid: 'draft-uuid'}}));

            formDraftService.getDraft('patient-1', 'provider-1');
            formDraftService.getDraft('patient-2', 'provider-1');

            expect(mockHttp.get.calls.count()).toBe(2);
        });

        it('should issue a fresh GET once the previous request has settled', function () {
            mockHttp.get.and.returnValue(specUtil.respondWithPromise($q, {data: {uuid: 'draft-uuid'}}));

            formDraftService.getDraft('patient-1', 'provider-1');
            $rootScope.$digest();
            formDraftService.getDraft('patient-1', 'provider-1');

            expect(mockHttp.get.calls.count()).toBe(2);
        });
    });

    describe('getResumableDraft', function () {
        var resolvedWith = function (response) {
            mockHttp.get.and.returnValue(specUtil.respondWithPromise($q, response));
            var result;
            formDraftService.getResumableDraft('patient-1', 'provider-1').then(function (draft) {
                result = draft;
            });
            $rootScope.$digest();
            return result;
        };

        it('should resolve to the draft when one is resumable', function () {
            var draft = resolvedWith({data: {uuid: 'draft-uuid', markedAsSaved: false}});
            expect(draft.uuid).toBe('draft-uuid');
        });

        it('should resolve to null when the draft is already marked as saved', function () {
            expect(resolvedWith({data: {uuid: 'draft-uuid', markedAsSaved: true}})).toBe(null);
        });

        it('should resolve to null when there is no draft', function () {
            expect(resolvedWith({data: {}})).toBe(null);
        });

        it('should resolve to null instead of rejecting when the request fails', function () {
            var deferred = $q.defer();
            mockHttp.get.and.returnValue(deferred.promise);
            var result = 'untouched';
            var rejected = false;
            formDraftService.getResumableDraft('patient-1', 'provider-1').then(function (draft) {
                result = draft;
            }, function () {
                rejected = true;
            });
            deferred.reject({status: 500});
            $rootScope.$digest();

            expect(rejected).toBe(false);
            expect(result).toBe(null);
        });

        it('should give concurrent callers the same answer from one request', function () {
            mockHttp.get.and.returnValue(specUtil.respondWithPromise($q, {data: {uuid: 'draft-uuid', markedAsSaved: false}}));
            var answers = [];
            formDraftService.getResumableDraft('patient-1', 'provider-1').then(function (d) { answers.push(d); });
            formDraftService.getResumableDraft('patient-1', 'provider-1').then(function (d) { answers.push(d); });
            $rootScope.$digest();

            expect(mockHttp.get.calls.count()).toBe(1);
            expect(answers.length).toBe(2);
            expect(answers[0]).toBe(answers[1]);
        });
    });
});
