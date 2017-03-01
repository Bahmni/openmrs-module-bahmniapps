'use strict'

describe('loginController', function () {
    var scope;
    var $timeout;
    var q;
    var state;
    var rootScope;

    beforeEach(module('bahmni.home'));
    beforeEach(module('stateMock'));
    beforeEach(inject(['$injector', '$timeout', '$q', '$rootScope', '$state', function ($injector, timeout, $q, $rootScope, $state) {
        q = $q;
        rootScope = $rootScope;
        $timeout = timeout;
        scope = $rootScope.$new();
        state = $state;
        }]));

});