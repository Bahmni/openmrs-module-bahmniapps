angular.module('bahmni.clinical')
    .controller('NewlyAddedTreatmentsController', ['$scope', '$rootScope', '$timeout', 'messagingService', 'treatmentConfig',
        function($scope, $rootScope, $timeout, messagingService, treatmentConfig){

        $scope.newlyAddedTreatments = $scope.consultation.tabTreatments;
        $scope.treatmentConfig = treatmentConfig;

        var defaultBulkDuration = function() {
            return {
                bulkDurationUnit : treatmentConfig.durationUnits ? treatmentConfig.durationUnits[0].name : ""
            };
        };

        $scope.bulkDurationData = defaultBulkDuration();


        var clearBulkDurationChange = function() {
            $scope.bulkDurationData = defaultBulkDuration();
            $scope.bulkSelectCheckbox = false;
        };

        var isDurationNullForAnyTreatment = function (newlyAddedTreatments) {
            var isDurationNull = false;
            newlyAddedTreatments.forEach(function (newlyAddedTreatment) {
                if(!newlyAddedTreatment.duration) {
                    isDurationNull = true;
                }
            });
            return isDurationNull;
        };

        var setNonCodedDrugConcept = function(newlyAddedTreatment) {
            if (newlyAddedTreatment.drugNonCoded) {
                newlyAddedTreatment.concept = treatmentConfig.nonCodedDrugconcept;
            }
        };


        $scope.bulkChangeDuration = function() {
            $scope.showBulkChangeToggle = !$scope.showBulkChangeToggle;
            clearBulkDurationChange();
            $scope.selectAllCheckbox();
            if($scope.showBulkChangeToggle){
                if(isDurationNullForAnyTreatment($scope.newlyAddedTreatments)) {
                    messagingService.showMessage("info", "There are drugs that do no have a duration specified." +
                        "Updating duration will update for those drugs as well");
                }
            }
        };


        $scope.selectAllCheckbox = function(){
            $scope.bulkSelectCheckbox = !$scope.bulkSelectCheckbox;
            $scope.newlyAddedTreatments.forEach(function (newlyAddedTreatment) {
                setNonCodedDrugConcept(newlyAddedTreatment);
                newlyAddedTreatment.durationUpdateFlag = $scope.bulkSelectCheckbox;
            });
        };

        $scope.bulkDurationChangeDone = function() {
            if($scope.bulkDurationData.bulkDuration && $scope.bulkDurationData.bulkDurationUnit){
                $scope.newlyAddedTreatments.forEach(function (newlyAddedTreatment) {
                    if(newlyAddedTreatment.durationUpdateFlag){
                        if(!newlyAddedTreatment.duration) {
                            newlyAddedTreatment.quantityEnteredManually = false;
                        }
                        newlyAddedTreatment.duration = $scope.bulkDurationData.bulkDuration;
                        newlyAddedTreatment.durationUnit = $scope.bulkDurationData.bulkDurationUnit;
                        newlyAddedTreatment.calculateDurationInDays();
                        newlyAddedTreatment.calculateQuantityAndUnit();
                    }
                });
            }
            clearBulkDurationChange();
            $scope.bulkChangeDuration();
        };

        $scope.updateDuration = function(stepperValue) {
            if(!$scope.bulkDurationData.bulkDuration && isNaN($scope.bulkDurationData.bulkDuration)){
                $scope.bulkDurationData.bulkDuration = 0
            }
            $scope.bulkDurationData.bulkDuration += stepperValue;
        };

        $scope.edit = function (index) {
            $rootScope.$broadcast("event:editNewlyAddedDrugOrders", index);
        };

        $scope.remove = function (index) {
            $scope.consultation.tabTreatments.splice(index, 1);
            $scope.newlyAddedTreatments = $scope.consultation.tabTreatments;
        };

        $scope.toggleShowAdditionalInstructions = function (line) {
            line.showAdditionalInstructions = !line.showAdditionalInstructions;
        };
    }]);