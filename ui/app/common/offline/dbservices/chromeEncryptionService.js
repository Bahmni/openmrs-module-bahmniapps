'use strict';

angular.module('bahmni.common.offline')
    .service('chromeEncryptionService', function () {

        var encrypt = function (jsonString) {
            return CryptoJS.AES.encrypt(jsonString, Bahmni.Common.Constants.key).toString();
        };

        var decrypt = function (encryptedString) {
            return JSON.parse(CryptoJS.AES.decrypt(encryptedString, Bahmni.Common.Constants.key).toString(CryptoJS.enc.Utf8))
        };  

        return {
            encrypt: encrypt,
            decrypt: decrypt
        }

    });
