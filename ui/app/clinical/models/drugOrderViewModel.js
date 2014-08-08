(function () {
    var self;
    Bahmni.Clinical.DrugOrderViewModel = function (extensionParams, routes) {
        self = this;
        this.prn = false;
        this.route = getDefaultRoute(extensionParams, routes);
    };
    
    var getDefaultRoute = function (extensionParams, routes) {
        var defaultRoute = extensionParams && extensionParams.defaultRoute;
        var selectedRoute = defaultRoute && _.find(routes, function (route) {
            return route.name === defaultRoute;
        });
        return selectedRoute && selectedRoute.name;
    };

    var simpleDoseAndFrequency = function () {
        return self.dose + " " +
            blankIfFalsy(self.doseUnit) + ", " +
            blankIfFalsy(self.frequency);
    };
    var numberBasedDoseAndFrequency = function () {
        return self.morningDose + "-" + self.afternoonDose + "-" + self.eveningDose;
    };
    var asNeeded = function (asNeeded) {
        return asNeeded ? "as needed" : "";
    };
    var blankIfFalsy = function (value) {
        return value ? value : "";
    };
    var getText = function () {
        return blankIfFalsy(self.drugName) + " - " +
            blankIfFalsy(getDoseAndFrequency()) + ", " +
            blankIfFalsy(self.instructions) + ", " +
            blankIfFalsy(asNeeded(self.asNeeded)) + ", " +
            blankIfFalsy(self.route) + " - " +
            blankIfFalsy(self.duration) + " " +
            blankIfFalsy(self.durationUnit) + " (" +
            blankIfFalsy(self.quantity) + " " +
            blankIfFalsy(self.quantityUnit) + ")";
    };
    var getDoseAndFrequency = function () {
        return self.dose ? simpleDoseAndFrequency() : numberBasedDoseAndFrequency();
    };
    
    Bahmni.Clinical.DrugOrderViewModel.prototype = {
        getText: getText
    };
}());