'use strict';

describe('primaryContactValidator', function () {
    var validator, ngDialog, closeDialog, $rootScope, input, form;

    beforeEach(module('bahmni.registration'));

    beforeEach(module(function ($provide) {
        ngDialog = jasmine.createSpyObj('ngDialog', ['open']);
        $provide.value('ngDialog', ngDialog);
    }));

    beforeEach(inject(function (primaryContactValidator, _$rootScope_, $q) {
        validator = primaryContactValidator;
        $rootScope = _$rootScope_;
        var closed = $q.defer();
        closeDialog = function () {
            closed.resolve();
            $rootScope.$digest();
        };
        ngDialog.open.and.returnValue({closePromise: closed.promise});
        form = angular.element('<form><span><input type="text" id="telephoneNumber"></span></form>');
        angular.element(document.body).append(form);
        input = form.find('input')[0];
    }));

    afterEach(function () {
        form.remove();
    });

    var arrow = function () {
        return form[0].querySelector('.primary-contact-arrow');
    };

    var typeValue = function (value) {
        input.value = value;
        angular.element(input).triggerHandler('input');
    };

    it('should allow saving when the field has a value', function () {
        input.value = '0821234567';

        expect(validator.validate()).toBe(true);
        expect(ngDialog.open).not.toHaveBeenCalled();
        expect(arrow()).toBeNull();
    });

    it('should block saving, alert and show the arrow when the field is empty', function () {
        expect(validator.validate()).toBe(false);
        expect(ngDialog.open.calls.mostRecent().args[0].template).toBe('views/primaryContactRequired.html');
        expect(arrow()).not.toBeNull();
    });

    it('should treat whitespace as empty', function () {
        input.value = '   ';

        expect(validator.validate()).toBe(false);
    });

    it('should allow saving when the field is not on the form', function () {
        form.remove();

        expect(validator.validate()).toBe(true);
        expect(ngDialog.open).not.toHaveBeenCalled();
    });

    it('should allow saving when the field is read-only', function () {
        input.disabled = true;

        expect(validator.validate()).toBe(true);
    });

    it('should expand only the section containing the field', function () {
        var contactSection = {attributes: [{name: 'telephoneNumber'}], expand: false};
        var otherSection = {attributes: [{name: 'education'}], expand: false};
        $rootScope.patientConfiguration = {
            getPatientAttributesSections: function () {
                return {contact: contactSection, other: otherSection};
            }
        };

        validator.validate();

        expect(contactSection.expand).toBe(true);
        expect(otherSection.expand).toBe(false);
    });

    it('should show only one arrow when save is clicked repeatedly', function () {
        validator.validate();
        validator.validate();

        expect(form[0].querySelectorAll('.primary-contact-arrow').length).toBe(1);
    });

    it('should not stack dialogs if the form is resubmitted while one is open', function () {
        validator.validate();
        expect(validator.validate()).toBe(false);

        expect(ngDialog.open.calls.count()).toBe(1);
    });

    it('should open the dialog again on a later save', function () {
        validator.validate();
        closeDialog();

        validator.validate();

        expect(ngDialog.open.calls.count()).toBe(2);
    });

    it('should remove the arrow when a value is typed, but not for whitespace', function () {
        validator.validate();

        typeValue('  ');
        expect(arrow()).not.toBeNull();

        typeValue('0');
        expect(arrow()).toBeNull();
    });

    it('should keep the arrow away if the field is cleared, until the next save', function () {
        validator.validate();
        typeValue('0');

        typeValue('');
        expect(arrow()).toBeNull();

        expect(validator.validate()).toBe(false);
        expect(arrow()).not.toBeNull();
    });

    it('should focus the field only after the alert closes', function () {
        spyOn(input, 'focus');
        spyOn(input, 'scrollIntoView');
        validator.validate();
        $rootScope.$digest();
        expect(input.focus).not.toHaveBeenCalled();

        closeDialog();

        expect(input.scrollIntoView).toHaveBeenCalled();
        expect(input.focus).toHaveBeenCalled();
    });
});
