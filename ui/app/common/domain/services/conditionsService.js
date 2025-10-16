'use strict';

angular.module('bahmni.common.domain')
    .service('conditionsService', ['$http', function ($http) {
        this.save = function (conditions, patientUuid) {
            var conditionsToBeSaved = _.reject(conditions, function (condition) {
                return condition.onSetDate === null || Number.isInteger(condition.onSetDate);
            });

            var promises = [];

            _.forEach(conditionsToBeSaved, function (conditionToSave) {
                var body = {
                    patient: patientUuid,
                    clinicalStatus: conditionToSave.status,
                    onsetDate: conditionToSave.onSetDate,
                    endDate: conditionToSave.endDate,
                    additionalDetail: conditionToSave.additionalDetail,
                    previousVersion: conditionToSave.previousConditionUuid
                };

                if (conditionToSave.isNonCoded && conditionToSave.conditionNonCoded) {
                    body.condition = { nonCoded: conditionToSave.conditionNonCoded };
                } else if (conditionToSave.concept && conditionToSave.concept.uuid) {
                    body.condition = { coded: conditionToSave.concept.uuid };
                }

                promises.push($http.post(Bahmni.Common.Constants.conditionUrl, body, {
                    withCredentials: true,
                    headers: { "Accept": "application/json", "Content-Type": "application/json" }
                }));
            });

            return promises[promises.length - 1];
        };

        this.getConditionHistory = function (patientUuid) {
            var params = {
                patientUuid: patientUuid,
                v: "full",
                includeInactive: true
            };
            return $http.get(Bahmni.Common.Constants.conditionHistoryUrl, {
                params: params,
                headers: {
                    withCredentials: true
                }
            });
        };
        this.getFollowUpConditionConcept = function () {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                params: {
                    name: Bahmni.Common.Constants.followUpConditionConcept,
                    v: "custom:(uuid,name:(name))"
                },
                cache: true
            });
        };
        var getLatestActiveCondition = function (conditionHistories, latestCondition) {
            var matchingConditions = _.filter(conditionHistories, function (condition) {
                var conceptUuid = _.get(condition, 'condition.coded.uuid');
                var nonCoded = _.get(condition, 'condition.nonCoded');
                return (conceptUuid && conceptUuid === latestCondition.concept.uuid) ||
                       (nonCoded && nonCoded === latestCondition.conditionNonCoded);
            });

            var activeCondition = _.find(matchingConditions, function (condition) {
                return condition.clinicalStatus === 'ACTIVE';
            });

            return activeCondition ? new Bahmni.Common.Domain.Condition(activeCondition) : latestCondition;
        };
        this.getConditions = function (patientUuid) {
            return this.getConditionHistory(patientUuid).then(function (response) {
                var conditionHistories = response.data.results;
                var conditions = Bahmni.Common.Domain.Conditions.fromConditionHistories(conditionHistories);
                _.forEach(conditions, function (condition) {
                    condition.activeSince = getLatestActiveCondition(conditionHistories, condition).onSetDate;
                });
                return conditions;
            });
        };
    }]);
