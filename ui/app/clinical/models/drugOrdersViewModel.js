'use strict';

Bahmni.Clinical.DrugOrdersViewModel = function () {
};

Bahmni.Clinical.DrugOrdersViewModel.prototype = new Array();

Bahmni.Clinical.DrugOrdersViewModel.createFromContract = function (drugOrders, extensionParams, treatmentConfig) {
    var drugOrdersViewModel = new Bahmni.Clinical.DrugOrdersViewModel();
    drugOrders.forEach(function (drugOrder) {
        drugOrdersViewModel.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, extensionParams, treatmentConfig));
    });
    return drugOrdersViewModel;
};

(function () {
    var DrugOrders = Bahmni.Clinical.DrugOrdersViewModel.prototype;

    DrugOrders.remove = function (index) {
        this.splice(index, 1);
    };

    DrugOrders.contains = function (drugOrder) {
        return _.some(this, function (treatment) {
            return treatment.drug.uuid === drugOrder.drug.uuid;
        });
    };

    DrugOrders.valid = function () {
        return _.every(this, function(drugOrder){
            return drugOrder.validate();
        });
    }
})();


