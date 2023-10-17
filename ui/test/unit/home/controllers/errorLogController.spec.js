describe('ErrorLogController', function () {
    var $controller, $scope, $q, spinner;

    beforeEach(module('bahmni.home'));

    beforeEach(inject(function (_$controller_, _$q_, _spinner_, $rootScope) {
        $controller = _$controller_;
        $q = _$q_;
        spinner = _spinner_;
        $scope = $rootScope.$new();
    }));

    it('should initialize errorLogs to an empty array', function () {
        var controller = $controller('ErrorLogController', { $q: $q, spinner: spinner, $scope: $scope });
        expect($scope.errorLogs).toEqual([]);
    });

    it('should initialize showErrorLog to true', function () {
        var controller = $controller('ErrorLogController', { $q: $q, spinner: spinner, $scope: $scope });
        expect($scope.showErrorLog).toBe(true);
    });
});
