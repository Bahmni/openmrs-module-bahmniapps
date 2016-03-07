'use strict';

describe('MessagingService', function () {

    var messagingService, rootScope, args;

    var timeout = function (fn) {
        args = arguments;
    };

    beforeEach(module('bahmni.registration'));
    beforeEach(module(function ($provide) {
        rootScope = jasmine.createSpyObj("rootScope", ["$on"]);
        $provide.value('$rootScope', rootScope);
        $provide.value('$timeout', timeout);
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


    it('should add messages and set isServerError to true', function () {
        messagingService.showMessage('info', 'message');

        expect(messagingService.messages).toBeTruthy();
        expect(messagingService.messages['info']).toBeTruthy();
        expect(args[1]).toEqual(4000);
        expect(args[2]).toBeTruthy();
        expect(messagingService.messages).toEqual({
            error: [],
            info: [{value: 'message', isServerError: false}],
            formError: []
        });
        args[0]();
        expect(messagingService.messages['info']).toEqual([]);
    });

});
