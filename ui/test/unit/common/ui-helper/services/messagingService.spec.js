'use strict';

describe('MessagingService', function () {

    var messagingService, rootScope;

    beforeEach(module('bahmni.registration'));
    beforeEach(module(function ($provide) {
        rootScope = jasmine.createSpyObj("rootScope", ["$on"]);
        $provide.value('$rootScope', rootScope);
    }));

    beforeEach(inject(['messagingService', function (messagingServiceInjected) {
        messagingService = messagingServiceInjected;
    }]));


    it('should listen for serverError events', function () {
        expect(rootScope.$on).toHaveBeenCalled();
    });

    it('should add messages', function () {
        messagingService.showMessage('error', 'message');

        expect(messagingService.messages).toBeTruthy();
        expect(messagingService.messages['error']).toBeTruthy();
        expect(messagingService.messages).toEqual({
            error: [{value: 'message', isServerError: false}],
            info: [],
            formError: []
        });
    });

    it('should add messages and set isServerError to true', function () {
        messagingService.showMessage('error', 'message', 'errorEvent');

        expect(messagingService.messages).toBeTruthy();
        expect(messagingService.messages['error']).toBeTruthy();
        expect(messagingService.messages).toEqual({
            error: [{value: 'message', isServerError: true}],
            info: [],
            formError: []
        });
    });


    it('should clear all messages', function () {
        messagingService.messages = {error: ['a', 'b']};

        messagingService.hideMessages('error');

        expect(messagingService.messages['error']).toBeTruthy();
        expect(messagingService.messages['error']).toEqual([]);
    });
});
