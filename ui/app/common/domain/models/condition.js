'use strict';

(function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var Conditions = Bahmni.Common.Domain.Conditions = {};
    var Condition = Bahmni.Common.Domain.Condition = function (data) {
        data = data || {};
        this.uuid = data.uuid;
        this.concept = {
            uuid: _.get(data, 'concept.uuid'),
            shortName: _.get(data, 'concept.shortName'),
            name: _.get(data, 'concept.name')
        };
        this.status = data.status;
        this.onSetDate = data.onSetDate;
        this.conditionNonCoded = data.conditionNonCoded;
        this.voided = data.voided;
        this.additionalDetail = data.additionalDetail;
        this.isNonCoded = data.isNonCoded;
        this.creator = data.creator;
        this.previousConditionUuid = data.previousConditionUuid;
        this.activeSince = data.onSetDate;
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
        return _.map(conditionsHistories, function (conditionsHistory) {
            var conditions = conditionsHistory.conditions;
            return new Condition(_.last(_.sortBy(_.reject(conditions, function (condition) {
                return condition.voided === true;
            }))), 'onSetDate');
        });
    };

    Conditions.getPreviousActiveCondition = function (condition, allConditions) {
        if (condition.status == 'ACTIVE') {
            return condition;
        }
        var previousCondition = _.find(allConditions, {uuid: condition.previousConditionUuid});
        if (!previousCondition) {
            return condition;
        }
        return Conditions.getPreviousActiveCondition(previousCondition, allConditions);
    };
})();
