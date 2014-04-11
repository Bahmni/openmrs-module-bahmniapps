Bahmni.Clinical.DrugOrder = (function () {
    var DrugOrder = function (options) {
        options = options || {};
        this.name = options.name;
        this.orderDate = options.orderDate;
        this.dosage = options.dosage;
        this.days = options.days;
        this.dose = options.dose;
    };

    DrugOrder.createFromOpenMRSRest = function (drugOrder) {
        return {name: drugOrder.drug.name,
            orderDate: drugOrder.startDate,
            dosage: drugOrder.drug.dosageForm.display,
            dose: drugOrder.dose,
            days: Bahmni.Common.Util.DateUtil.diffInDays(new Date(drugOrder.startDate), new Date(drugOrder.autoExpireDate))}
    };

    return DrugOrder;
})();

