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
            alert: []
        });
    });

    it('should add messages and set isServerError to true', function () {
        messagingService.showMessage('error', 'message', 'errorEvent');

        expect(messagingService.messages).toBeTruthy();
        expect(messagingService.messages['error']).toBeTruthy();
        expect(messagingService.messages).toEqual({
            error: [{value: 'message', isServerError: true}],
            info: [],
            alert: []
        });
    });


    it('should clear all messages for a given level', function () {
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
            alert: []
        });
        args[0]();
        expect(messagingService.messages['info']).toEqual([]);
    });

    it('should not have multiple messages of same content', function () {
        messagingService.showMessage('error', 'message');
        messagingService.showMessage('error', 'message');

        expect(messagingService.messages).toBeTruthy();
        expect(messagingService.messages['error']).toBeTruthy();
        expect(messagingService.messages).toEqual({
            info: [],
            error: [{value: 'message', isServerError: false}],
            alert: []
        });
        expect(messagingService.messages['error'].length).toEqual(1);
    });

    it('should not have multiple messages of different content', function () {
        messagingService.showMessage('error', 'message');
        messagingService.showMessage('error', 'le message');

        expect(messagingService.messages).toBeTruthy();
        expect(messagingService.messages['error']).toBeTruthy();
        expect(messagingService.messages).toEqual({
            info: [],
            error: [{value: 'message', isServerError: false}, {value: 'le message', isServerError: false}],
            alert: []
        });
        expect(messagingService.messages['error'].length).toEqual(2);
    });
});
