describe('bedAssignmentDialog directive', function () {
    var $compile, $rootScope, $document;
    beforeEach(module('bahmni.adt'));
    beforeEach(inject(function (_$compile_, _$rootScope_, _$document_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $document = _$document_;
    }));
    it('should set bed details and position the bed info element', function () {
        var scope = $rootScope.$new();
        var element = angular.element('<div bed-assignment-dialog></div>');
        $compile(element)(scope);
        scope.cell = {
            bed: {
                bedId: 1,
                bedNumber: '1'
            }
        };
        scope.setBedDetails = jasmine.createSpy('setBedDetails');

        element.triggerHandler('click');   
        expect(scope.setBedDetails).toHaveBeenCalledWith(scope.cell);
    });
});
