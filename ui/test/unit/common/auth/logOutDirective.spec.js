'use strict';

describe("logOut directive", function () {
    var $compile, $rootScope, sessionService, formDraftService, ngDialog, auditLogService, mockWindow, element, scope, fakeDialog, keydownHandler;

    beforeEach(module('authentication'));
    beforeEach(module(function ($provide) {
        formDraftService = jasmine.createSpyObj('formDraftService', ['hasDraftsForProvider']);
        ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
        auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
        auditLogService.log.and.returnValue(specUtil.respondWith({}));

        fakeDialog = {id: 'logout-drafts-warning-dialog'};
        ngDialog.open.and.returnValue(fakeDialog);

        mockWindow = {
            location: {},
            addEventListener: jasmine.createSpy('addEventListener').and.callFake(function (event, handler) {
                keydownHandler = handler;
            }),
            removeEventListener: jasmine.createSpy('removeEventListener')
        };

        $provide.value('formDraftService', formDraftService);
        $provide.value('ngDialog', ngDialog);
        $provide.value('auditLogService', auditLogService);
        $provide.value('$window', mockWindow);
        $provide.value('$bahmniCookieStore', jasmine.createSpyObj('$bahmniCookieStore', ['get', 'put', 'remove']));
    }));

    beforeEach(inject(function (_$compile_, _$rootScope_, _sessionService_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        sessionService = _sessionService_;
        spyOn(sessionService, 'destroy').and.returnValue(specUtil.respondWith({}));

        $rootScope.currentProvider = {uuid: 'provider-uuid-456'};
        $rootScope.quickLogoutComboKey = 'l';
        $rootScope.formDraftFeatureEnabled = true;
        scope = $rootScope.$new();
        element = $compile('<a log-out></a>')(scope);
        scope.$digest();
    }));

    it("should logout directly without showing the warning popup when the provider has no drafts", function (done) {
        formDraftService.hasDraftsForProvider.and.returnValue(specUtil.respondWith(false));

        element.triggerHandler('click');

        setTimeout(function () {
            expect(formDraftService.hasDraftsForProvider).toHaveBeenCalledWith('provider-uuid-456');
            expect(ngDialog.open).not.toHaveBeenCalled();
            expect(auditLogService.log).toHaveBeenCalledWith(undefined, 'USER_LOGOUT_SUCCESS', undefined, 'MODULE_LABEL_LOGOUT_KEY');
            expect(sessionService.destroy).toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should show the drafts warning popup instead of logging out when the provider has drafts", function (done) {
        formDraftService.hasDraftsForProvider.and.returnValue(specUtil.respondWith(true));

        element.triggerHandler('click');

        setTimeout(function () {
            expect(ngDialog.open).toHaveBeenCalled();
            expect(sessionService.destroy).not.toHaveBeenCalled();

            var dialogConfig = ngDialog.open.calls.mostRecent().args[0];
            expect(dialogConfig.template).toBe('../common/auth/views/discardDraftsWarning.html');
            expect(dialogConfig.className).toBe('ngdialog-theme-default discard-draft-modal');
            done();
        }, 0);
    });

    it("should logout when the 'logout' action of the drafts warning popup is invoked", function (done) {
        formDraftService.hasDraftsForProvider.and.returnValue(specUtil.respondWith(true));

        element.triggerHandler('click');

        setTimeout(function () {
            var dialogScope = ngDialog.open.calls.mostRecent().args[0].scope;
            dialogScope.logout();

            setTimeout(function () {
                expect(ngDialog.close).toHaveBeenCalledWith(fakeDialog.id);
                expect(auditLogService.log).toHaveBeenCalledWith(undefined, 'USER_LOGOUT_SUCCESS', undefined, 'MODULE_LABEL_LOGOUT_KEY');
                expect(sessionService.destroy).toHaveBeenCalled();
                done();
            }, 0);
        }, 0);
    });

    it("should only close the popup without logging out when the 'cancel' action is invoked", function (done) {
        formDraftService.hasDraftsForProvider.and.returnValue(specUtil.respondWith(true));

        element.triggerHandler('click');

        setTimeout(function () {
            var dialogScope = ngDialog.open.calls.mostRecent().args[0].scope;
            dialogScope.cancel();

            expect(ngDialog.close).toHaveBeenCalledWith(fakeDialog.id);
            expect(sessionService.destroy).not.toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should logout directly without checking for drafts when enableFormDraftFeature config is false", function (done) {
        $rootScope.formDraftFeatureEnabled = false;

        element.triggerHandler('click');

        setTimeout(function () {
            expect(formDraftService.hasDraftsForProvider).not.toHaveBeenCalled();
            expect(ngDialog.open).not.toHaveBeenCalled();
            expect(sessionService.destroy).toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should logout directly without checking for drafts when the app config has no toggle value (null defaults to disabled)", function (done) {
        $rootScope.formDraftFeatureEnabled = null;

        element.triggerHandler('click');

        setTimeout(function () {
            expect(formDraftService.hasDraftsForProvider).not.toHaveBeenCalled();
            expect(ngDialog.open).not.toHaveBeenCalled();
            expect(sessionService.destroy).toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should logout directly when the app descriptor is not yet available (defaults to disabled)", function (done) {
        $rootScope.formDraftFeatureEnabled = false;

        element.triggerHandler('click');

        setTimeout(function () {
            expect(formDraftService.hasDraftsForProvider).not.toHaveBeenCalled();
            expect(ngDialog.open).not.toHaveBeenCalled();
            expect(sessionService.destroy).toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should logout without blocking when the drafts check fails", function (done) {
        formDraftService.hasDraftsForProvider.and.returnValue({
            then: function (success, failure) {
                failure('some error');
            }
        });

        element.triggerHandler('click');

        setTimeout(function () {
            expect(ngDialog.open).not.toHaveBeenCalled();
            expect(sessionService.destroy).toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should not start a second logout attempt when logout is triggered again while one is already in flight", function (done) {
        formDraftService.hasDraftsForProvider.and.returnValue(specUtil.respondWith(true));

        element.triggerHandler('click');
        element.triggerHandler('click');

        setTimeout(function () {
            expect(formDraftService.hasDraftsForProvider.calls.count()).toBe(1);
            expect(ngDialog.open.calls.count()).toBe(1);
            done();
        }, 0);
    });

    it("should logout directly via the keyboard shortcut when the provider has no drafts", function (done) {
        formDraftService.hasDraftsForProvider.and.returnValue(specUtil.respondWith(false));

        keydownHandler({metaKey: true, key: 'l'});

        setTimeout(function () {
            expect(formDraftService.hasDraftsForProvider).toHaveBeenCalledWith('provider-uuid-456');
            expect(ngDialog.open).not.toHaveBeenCalled();
            expect(sessionService.destroy).toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should show the drafts warning popup via the keyboard shortcut when the provider has drafts", function (done) {
        formDraftService.hasDraftsForProvider.and.returnValue(specUtil.respondWith(true));

        keydownHandler({metaKey: true, key: 'l'});

        setTimeout(function () {
            expect(ngDialog.open).toHaveBeenCalled();
            expect(sessionService.destroy).not.toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should logout directly via the keyboard shortcut when enableFormDraftFeature config is false", function (done) {
        $rootScope.formDraftFeatureEnabled = false;

        keydownHandler({metaKey: true, key: 'l'});

        setTimeout(function () {
            expect(formDraftService.hasDraftsForProvider).not.toHaveBeenCalled();
            expect(sessionService.destroy).toHaveBeenCalled();
            done();
        }, 0);
    });
});
