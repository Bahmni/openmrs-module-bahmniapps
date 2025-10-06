'use strict';

(function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var Conditions = Bahmni.Common.Domain.Conditions = {};
    var Condition = Bahmni.Common.Domain.Condition = function (data) {
        data = data || {};
        this.uuid = data.uuid;
        this.concept = {
            uuid: _.get(data, 'condition.coded.uuid') || _.get(data, 'concept.uuid'),
            shortName: _.get(data, 'condition.coded.name.name') || _.get(data, 'concept.shortName'),
            name: _.get(data, 'condition.coded.display') || data.display || _.get(data, 'concept.name')
        };
        this.status = data.clinicalStatus || data.status;
        this.onSetDate = data.onsetDate || data.onSetDate;
        this.conditionNonCoded = _.get(data, 'condition.nonCoded') || data.conditionNonCoded;
        this.voided = data.voided;
        this.additionalDetail = data.additionalDetail;
        this.isNonCoded = !!_.get(data, 'condition.nonCoded') || data.isNonCoded;
        this.creator = _.get(data, 'auditInfo.creator.display') || data.creator;
        this.previousConditionUuid = _.get(data, 'previousVersion.uuid') || data.previousConditionUuid;
        this.activeSince = data.onsetDate;
    };
    Condition.prototype = {};
    Condition.prototype.toggleNonCoded = function () {
        this.isNonCoded = !this.isNonCoded;
    };
    Condition.prototype.clearConcept = function () {
        this.concept.uuid = undefined;
    };
    Condition.prototype.isValidConcept = function () {
        return !(this.concept.name && !this.concept.uuid && !this.isNonCoded);
    };
    Condition.prototype.isValid = function () {
        return this.status && ((this.concept.name && this.isNonCoded) || this.concept.uuid);
    };
    Condition.prototype.isActive = function () {
        return this.status == 'ACTIVE';
    };
    Condition.prototype.displayString = function () {
        return this.conditionNonCoded || this.concept.shortName || this.concept.name;
    };
    Condition.prototype.isEmpty = function () {
        return !this.status && !this.concept.name && !(this.isNonCoded || this.concept.uuid)
            && !this.onSetDate && !this.additionalDetail;
    };

    Condition.createFromDiagnosis = function (diagnosis) {
        return new Condition({
            concept: {
                uuid: diagnosis.codedAnswer.uuid,
                shortName: diagnosis.codedAnswer.shortName,
                name: diagnosis.codedAnswer.name
            },
            status: 'ACTIVE',
            onSetDate: DateUtil.today(),
            conditionNonCoded: diagnosis.freeTextAnswer,
            additionalDetail: diagnosis.comments,
            voided: false
        });
    };

    Conditions.fromConditionHistories = function (conditionsHistories) {
        if (conditionsHistories && conditionsHistories.length > 0 && conditionsHistories[0].uuid) {
            var groupedConditions = _.groupBy(conditionsHistories, function (condition) {
                var conceptUuid = _.get(condition, 'condition.coded.uuid') || '';
                var nonCoded = _.get(condition, 'condition.nonCoded') || '';
                return conceptUuid + '|' + nonCoded;
            });
            return _.map(groupedConditions, function (conditionGroup) {
                var nonVoidedConditions = _.reject(conditionGroup, function (condition) {
                    return condition.voided === true;
                });
                var latestCondition = _.last(_.sortBy(nonVoidedConditions, 'onsetDate'));
                return new Condition(latestCondition);
            });
        }
        return _.map(conditionsHistories, function (conditionsHistory) {
            var conditions = conditionsHistory;
            const response = new Condition(_.last(_.sortBy(_.reject(conditions, function (condition) {
                return condition.voided === true;
            })), 'onsetDate'));
            return response;
        });
    };

    Conditions.getPreviousActiveCondition = function (condition, allConditions) {
        if (condition.clinicalStatus == 'ACTIVE') {
            return condition;
        }
        var previousCondition = _.find(allConditions, { uuid: condition.previousConditionUuid });
        if (!previousCondition) {
            return condition;
        }
        return Conditions.getPreviousActiveCondition(previousCondition, allConditions);
    };
})();
