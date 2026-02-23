/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.uiHelper')
    .service('messagingService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        this.messages = {error: [], info: [], alert: []};
        var self = this;

        $rootScope.$on('event:serverError', function (event, errorMessage) {
            self.showMessage('error', errorMessage, 'serverError');
        });

        this.showMessage = function (level, message, errorEvent) {
            var messageObject = {'value': '', 'isServerError': false};
            messageObject.value = message ? message.replace(/\[|\]|null/g, '') : " ";
            if (errorEvent) {
                messageObject.isServerError = true;
                if (!self.messages[level].length) {
                    this.createTimeout('error', 6000);
                }
            } else if (level == 'info') {
                this.createTimeout('info', 4000);
            }

            var index = _.findIndex(this.messages[level], function (msg) {
                return msg.value == messageObject.value;
            });

            if (index >= 0) {
                this.messages[level].splice(index, 1);
            }
            if (messageObject.value) {
                this.messages[level].push(messageObject);
            }
        };

        this.createTimeout = function (level, time) {
            $timeout(function () {
                self.messages[level] = [];
            }, time, true);
        };

        this.hideMessages = function (level) {
            self.messages[level].length = 0;
        };

        this.clearAll = function () {
            self.messages["error"] = [];
            self.messages["info"] = [];
            self.messages["alert"] = [];
        };
    }]);
