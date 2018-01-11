'use strict';

Bahmni.Registration.Identifier = function (identifierType) {
    this.identifierType = identifierType;
    this.preferred = identifierType.primary;
    this.voided = false;
    return this;
};

var prototype = Bahmni.Registration.Identifier.prototype;
prototype.hasIdentifierSources = function () {
    return this.identifierType.identifierSources.length > 0;
};

prototype.isPrimary = function () {
    return this.identifierType.primary;
};
prototype.map = function (identifiers) {
    var savedIdentifier = _.find(identifiers, {identifierType: {uuid: this.identifierType.uuid}});
    if (savedIdentifier) {
        this.registrationNumber = savedIdentifier.identifier;
        this.identifier = savedIdentifier.identifier;
        this.preferred = savedIdentifier.preferred;
        this.voided = savedIdentifier.voided;
        this.uuid = savedIdentifier.uuid;
    }
    return this;
};

prototype.hasIdentifierSourceWithEmptyPrefix = function () {
    var identifierSources = this.identifierType.identifierSources;
    return identifierSources.length === 1 && _.isEmpty(identifierSources[0].prefix);
};

prototype.isIdentifierRequired = function () {
    if (this.hasOldIdentifier) {
        return true;
    } else if (this.identifierType.required) {
        return !this.hasIdentifierSources();
    }
    return false;
};

prototype.generate = function () {
    if (this.registrationNumber && this.registrationNumber.length > 0) {
        this.identifier = this.selectedIdentifierSource ? this.selectedIdentifierSource.prefix + this.registrationNumber : this.registrationNumber;
        this.voided = false;
    } else if (this.uuid) {
        this.voided = true;
    }
};

prototype.clearRegistrationNumber = function () {
    this.registrationNumber = null;
    this.identifier = null;
};

