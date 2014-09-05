describe("DrugSchedule", function () {
    var visit;
    var DrugSchedule = Bahmni.Clinical.DrugSchedule;
    var DrugOrder = Bahmni.Clinical.DrugOrder;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var createDrugOrder = function (name, startDate, endDate) {
        return {drugName: name, effectiveStartDate: startDate, effectiveStopDate: endDate};
    };

    beforeEach(function () {
        visit = jasmine.createSpyObj('visit', ['getAdmissionDate', 'getDischargeDispositionEncounterDate', 'getDischargeDate']);
    });

    describe("create", function () {
        it("should initialize DrugSchedule with visit admission date, discharge disposition date and drug orders within these dates", function () {
            var admissionDate = DateUtil.parse('2014-04-10T15:52:59.000+0530');
            var dischargeDate = DateUtil.parse('2014-04-20T15:52:59.000+0530');
            var beclomateAfterDischarge = createDrugOrder('Beclomate', '2014-04-21T12:55:00.000+0530', '2014-04-23T15:52:59.000+0530');
            var calpolAfterAdmissionBeforeDishcarge = createDrugOrder('Calpol', '2014-04-15T15:55:00.000+0530', '2014-04-18T15:52:59.000+0530');
            var amoxyBeforeAdmissionAfterDishcarge = createDrugOrder('Amoxy', '2014-04-11T11:52:00.000+0530', '2014-04-20T11:52:59.000+0530');
            var paracetamolBeforeAdmission = createDrugOrder('Paracetamol', '2014-04-04T11:52:00.000+0530', '2014-04-09T11:52:59.000+0530');
            var salbutamolDuringDichrageDisposition = createDrugOrder('Salbutamol', dischargeDate, '2014-04-29T11:52:59.000+0530');
            visit.drugOrders = [beclomateAfterDischarge, calpolAfterAdmissionBeforeDishcarge, amoxyBeforeAdmissionAfterDishcarge, paracetamolBeforeAdmission, salbutamolDuringDichrageDisposition];

            var drugSchedule = DrugSchedule.create( admissionDate, dischargeDate, visit.drugOrders);

            expect(drugSchedule.fromDate).toBe(admissionDate);
            expect(drugSchedule.toDate).toBe(dischargeDate);
            expect(drugSchedule.drugOrders.length).toBe(2);
            expect(drugSchedule.drugOrders[0].drugName).toBe('Calpol');
            expect(drugSchedule.drugOrders[1].drugName).toBe('Amoxy');
        });

        it("should initialize end date to today when discharge date is not provided", function () {
            var admissionDate = DateUtil.parse('2014-04-10T15:52:59.000+0530');
            var dischargeDate = DateUtil.parse('2014-04-20T15:52:59.000+0530');
            var beclomateAfterDischarge = createDrugOrder('Beclomate', '2014-04-21T15:55:00.000+0530', '2014-04-26T15:52:59.000+0530');
            var calpolAfterAdmissionBeforeDishcarge = createDrugOrder('Calpol', '2014-04-15T15:55:00.000+0530', '2014-04-18T15:52:59.000+0530');
            var amoxyBeforeAdmissionAfterDishcarge = createDrugOrder('Amoxy', '2014-04-11T11:52:00.000+0530', '2014-04-20T11:52:59.000+0530');
            var paracetamolBeforeAdmission = createDrugOrder('Paracetamol', '2014-04-04T11:52:00.000+0530', '2014-04-09T11:52:59.000+0530');
            visit.drugOrders = [beclomateAfterDischarge, calpolAfterAdmissionBeforeDishcarge, amoxyBeforeAdmissionAfterDishcarge, paracetamolBeforeAdmission];

            var drugSchedule = DrugSchedule.create(admissionDate, dischargeDate, visit.drugOrders);

            expect(drugSchedule.fromDate).toBe(admissionDate);
            expect(drugSchedule.toDate).toBe(dischargeDate);
            expect(drugSchedule.drugOrders.length).toBe(2);
            expect(drugSchedule.drugOrders[0].drugName).toBe('Calpol');
            expect(drugSchedule.drugOrders[1].drugName).toBe('Amoxy');
        });

        it("should initialize end date to today when discharge disposition date and discharge date is not provided", function () {
            var admissionDate = DateUtil.parse('2014-04-10T15:52:59.000+0530');
            spyOn(DateUtil, 'now').and.returnValue(DateUtil.parse('2014-04-20T15:52:59.000+0530'));
            var dischargeDate = DateUtil.now();
            var calpolAfterAdmission = createDrugOrder('Calpol', '2014-04-15T15:55:00.000+0530', '2014-04-18T15:52:59.000+0530');
            var amoxyBeforeAdmissionBeforeToday = createDrugOrder('Amoxy', '2014-04-11T11:52:00.000+0530', '2014-04-20T11:52:59.000+0530');
            var paracetamolBeforeAdmission = createDrugOrder('Paracetamol', '2014-04-04T11:52:00.000+0530', '2014-04-09T11:52:59.000+0530');
            visit.drugOrders = [calpolAfterAdmission, amoxyBeforeAdmissionBeforeToday, paracetamolBeforeAdmission];

            var drugSchedule = DrugSchedule.create(admissionDate, dischargeDate, visit.drugOrders);

            expect(drugSchedule.fromDate).toBe(admissionDate);
            expect(drugSchedule.toDate).toBe(DateUtil.now() );
            expect(drugSchedule.drugOrders.length).toBe(2);
            expect(drugSchedule.drugOrders[0].drugName).toBe('Calpol');
            expect(drugSchedule.drugOrders[1].drugName).toBe('Amoxy');
        });
    });

    describe("getDays", function () {
        it("should get days from fromDate to toDate", function () {
            var fromDate = DateUtil.parse('2014-04-10T15:52:59.000+0530');
            var toDate = DateUtil.parse('2014-04-12T16:52:59.000+0530');
            var drugSchedule = new DrugSchedule(fromDate, toDate, []);

            var days = drugSchedule.getDays();

            expect(days.length).toBe(3);
            expect(days[0].dayNumber).toBe(1);
            expect(days[0].date).toEqual(DateUtil.parse('2014-04-10'));
            expect(days[1].dayNumber).toBe(2);
            expect(days[1].date).toEqual(DateUtil.parse('2014-04-11'));
            expect(days[2].dayNumber).toBe(3);
            expect(days[2].date).toEqual(DateUtil.parse('2014-04-12'));
        });

        it("should consider actual days covered, ignoring time", function () {
            var fromDate = DateUtil.parse('2014-04-10T15:52:59.000+0530');
            var toDate = DateUtil.parse('2014-04-12T14:52:59.000+0530');
            var drugSchedule = new DrugSchedule(fromDate, toDate, []);

            var days = drugSchedule.getDays();

            expect(days.length).toBe(3);
            expect(days[0].date).toEqual(DateUtil.parse('2014-04-10'));
            expect(days[1].date).toEqual(DateUtil.parse('2014-04-11'));
            expect(days[2].date).toEqual(DateUtil.parse('2014-04-12'));
        });
    });

    describe("getDrugs", function () {
        it("should group drug orders by drug", function () {
            var fromDate = DateUtil.parse('2014-04-10T15:52:59.000+0530');
            var toDate = DateUtil.parse('2014-04-15T16:52:59.000+0530');
            var calpolRepeatOrder = createDrugOrder('Calpol', '2014-04-14T15:52:59.000+0530', '2014-04-15T15:52:59.000+0530');
            var amoxyOrder = createDrugOrder('Amoxy', '2014-04-13T15:52:59.000+0530', '2014-04-15T15:52:59.000+0530');
            var calpolInitialOrder = createDrugOrder('Calpol', '2014-04-10T15:52:59.000+0530', '2014-04-12T15:52:59.000+0530');
            var drugSchedule = new DrugSchedule(fromDate, toDate, [calpolRepeatOrder, amoxyOrder, calpolInitialOrder]);

            var drugs = drugSchedule.getDrugs();

            expect(drugs.length).toBe(2);
            expect(drugs[0].name).toBe('Calpol');
            expect(drugs[0].orders.length).toBe(2);
            expect(drugs[0].isActiveOnDate(DateUtil.parse('2014-04-12'))).toBe(true);
            expect(drugs[0].isActiveOnDate(DateUtil.parse('2014-04-13'))).toBe(false);
            expect(drugs[0].isActiveOnDate(DateUtil.parse('2014-04-14'))).toBe(true);
            expect(drugs[1].name).toBe('Amoxy');
            expect(drugs[1].orders.length).toBe(1);
        });
    });
});