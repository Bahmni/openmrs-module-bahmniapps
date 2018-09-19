'use strict';

describe('checkinPopUp', function () {
    var rootScope, checkinPopUp, popUpScope, ngDialog, dialog;

    beforeEach(function () {
        module('bahmni.appointments');
        module(function ($provide) {
            popUpScope = {$destroy: function () {
            }};
            ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
            $provide.value('ngDialog', ngDialog);
        });
    });

    beforeEach(inject(['$rootScope', 'checkinPopUp',function($rootScope, _checkinPopUp_) {
        rootScope = $rootScope;
        checkinPopUp = _checkinPopUp_;
    }]));

    beforeEach(function () {
        spyOn(rootScope, '$new');
        rootScope.$new.and.returnValue(popUpScope);
        dialog = { id: 'id1' };
        ngDialog.open.and.returnValue(dialog);
    });

    it('should open ngDialog with properties', function () {
        var config = {scope: popUpScope};
        checkinPopUp(config);
        expect(ngDialog.open).toHaveBeenCalledWith({
            template: '../appointments/views/checkInPopUp.html',
            scope: popUpScope,
                className: 'ngdialog-theme-default'
        });
    });

    it('should call ngDialog close with two arguments on popUp close', function () {
        var config = {scope: popUpScope};
        checkinPopUp(config);
        popUpScope.close();
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it('should call confirmAction with correct parameter on checkIn', function () {
        popUpScope.action = function(){};
        var config = {scope:popUpScope };
        spyOn(config.scope, "action");
        checkinPopUp(config);
        var time = new Date();
        var f = function(){};

        popUpScope.performAction(f, time);

        expect(config.scope.action).toHaveBeenCalledWith(time, f);
    })

});
