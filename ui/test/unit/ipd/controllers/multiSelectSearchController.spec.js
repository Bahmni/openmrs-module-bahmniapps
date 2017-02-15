'use strict';

describe('multiSelectSearchController', function() {

    var controller, rootScope, scope, ngDialog, messagingService, spinner, $http, q;

    ngDialog = jasmine.createSpyObj('ngDialog',['close']);
    messagingService = jasmine.createSpyObj('messagingService',['showMessage']);
    spinner = jasmine.createSpyObj('spinner',['forPromise']);
    $http = jasmine.createSpyObj('$http',['get', 'post', 'delete']);

    var tags = [{"id":1,"name":"Lost","uuid":"73e846d6-ed5f-11e6-a3c9-0800274a5156"},{"id":2,"name":"Oxygen","uuid":"74d2757a-ed5f-11e6-a3c9-0800274a5156"},{"id":3,"name":"Isolation","uuid":"76783641-ed5f-11e6-a3c9-0800274a5156"},{"id":4,"name":"Strict Isolation","uuid":"7739dc9f-ed5f-11e6-a3c9-0800274a5156"}]
    $http.get.and.returnValue(specUtil.simplePromise({data:{results: tags}}));
    beforeEach(function() {
        module('bahmni.ipd');
    });

    var initController = function (rootScope) {
        controller('multiSelectSearchController', {
            $scope: scope,
            $rootScope: rootScope,
            $q: q,
            $http: $http,
            ngDialog: ngDialog,
            messagingService: messagingService,
            spinner: spinner
        });
    };

    beforeEach(function() {
        inject(function($controller, $rootScope, $q) {
            controller = $controller;
            rootScope = $rootScope;
            q = $q;
            scope = $rootScope.$new();
        });
    });

    it('should close ngDialog on cancel', function() {
        rootScope.selectedBedInfo = {bed: {bedTagMap: []}};
        initController(rootScope);
        scope.cancelConfirmationDialog();
        expect(ngDialog.close).toHaveBeenCalled();
    });
});