xdescribe("selectAllCheckbox()", function () {
    var scope, messagingService, compile, rootScope;

    beforeEach(function () {
        module('bahmni.common.uiHelper');
        module('bahmni.clinical');
        module('ngHtml2JsPreprocessor');
        module('bahmni.common.i18n');

        module(function ($provide) {
            messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
            $provide.value('messagingService', messagingService);
        });


        inject(function ($compile, $rootScope) {
            compile = $compile;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });

    });
    var generateElement = function () {
        var unCompiledHtml =
            '<new-drug-orders ' +
            'treatments="treatments" ' +
            'treatment-config="treatmentConfig"> ' +
            '</new-drug-orders>';

        var element = compile(angular.element(unCompiledHtml))(scope);
        scope.$digest();
        return element;
    };

    beforeEach(function () {
        scope.treatments = [];
        scope.treatmentConfig = {};
    });

    it("should add additional attribute with the name as durationUpdateFlag", function () {
        var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
        drugOrder.durationUnit = {name: "Days"};
        drugOrder.route = {name: "Orally"};
        drugOrder.uniformDosingType.dose = "1";
        drugOrder.doseUnits = "Capsule";
        drugOrder.uniformDosingType.frequency = {name: "Once a day"};
        drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        drugOrder.durationInDays = 1;

        scope.treatments.push(drugOrder);
        scope.showBulkChangeToggle = true;


        var element = generateElement();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        compiledElementScope.selectAllCheckbox();
        expect(compiledElementScope.treatments.length).toBe(1);
        expect(compiledElementScope.treatments[0].durationUpdateFlag).toBeTruthy();
    });
});

xdescribe("bulkDurationChangeDone()", function () {
    it("should modify durationInDays and amount of drug units as per the new input", function () {
        var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
        drugOrder.durationUnit = {name: "Days"};
        drugOrder.route = {name: "Orally"};
        drugOrder.uniformDosingType.dose = "1";
        drugOrder.doseUnits = "Capsule";
        drugOrder.uniformDosingType.frequency = {name: "Once a day"};
        drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        drugOrder.durationInDays = 1;
        drugOrder.durationUpdateFlag = true;

        scope.treatments = [];
        scope.treatments.push(drugOrder);
        scope.showBulkChangeToggle = true;

        scope.bulkDurationData.bulkDuration = 2;
        scope.bulkDurationData.bulkDurationUnit = "Day(s)";

        scope.bulkDurationChangeDone();

        expect(drugOrder.durationInDays).toBe(2);
    });
});
