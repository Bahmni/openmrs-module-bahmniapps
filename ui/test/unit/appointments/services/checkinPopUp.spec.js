'use strict';

describe('checkinPopUp', function () {
    var rootScope, checkinPopUp, popUpScope, ngDialog;

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
    });

    it('should open ngDialog with properties', function () {
        var config = {scope: {appointments: []}};
        checkinPopUp(config);
        expect(ngDialog.open).toHaveBeenCalledWith({
            template: '../appointments/views/checkInPopUp.html',
            scope: popUpScope,
                className: 'ngdialog-theme-default'
        });
    });

    it('should call ngDialog close with two arguments on popUp close', function () {
        var config = {scope: {appointments: []}};
        checkinPopUp(config);
        popUpScope.close();
        expect(ngDialog.close).toHaveBeenCalledWith(undefined, true);
    })

    it('should call confirmAction with correct parameter on checkIn', function () {
        var config = {scope: {appointments: [], confirmAction : function () {}}};
        spyOn(config.scope, "confirmAction");
        checkinPopUp(config);
        popUpScope.checkIn();
        expect(config.scope.confirmAction).toHaveBeenCalledWith('CheckedIn');
    })

});
