'use strict';

angular.module('registration.patient.directives')
.directive('addressFields', function ($parse) {
    var template =  '<section class="form-field-inline" ng-repeat="addressLevels in addressLevelsChunks">'+
                        '<article class="form-field" ng-repeat="addressLevel in addressLevels">'+
                                '<div class="field-attribute">'+
                                    '<label for="{{addressLevel.addressField}}">{{addressLevel.name}}<span class="asterick" ng-show="addressLevel.required">*</span></label>'+
                                '</div>'+
                                '<div class="field-value">'+
                                    '<input type="text" id="{{addressLevel.addressField}}" non-blank="addressLevel.required" ng-model="$parent.address[addressLevel.addressField]" placeholder="{{addressLevel.name}}"' +
                                    'my-autocomplete source="getAddressEntryList(addressLevel.addressField)" response-map="getAddressDataResults" on-select="addressFieldSelected(addressLevel.addressField)"' +
                                     '>'+
                                '</div>'+
                        '</article>'+
                    '</section>';
    return {
        restrict: 'AE',
        template: template,
        controller: 'AddressFieldsDirectiveController',
        scope: {
            address: '=',
            addressLevels: '='
        }
    };
})
.controller('AddressFieldsDirectiveController', function($scope, addressAttributeService, arrayUtil) {
    var addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse()
    $scope.addressLevelsChunks = arrayUtil.chunk(addressLevelsCloneInDescendingOrder, 2)
    var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function(addressLevel){
        return addressLevel.addressField;
    });

    $scope.addressFieldSelected = function (fieldName) {
        return function(addressFieldItem) {
            var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
            var parent = addressFieldItem.addressField.parent;
            parentFields.forEach(function (parentField) {
                if (!parent) return;
                $scope.address[parentField] = parent.name;
                parent = parent.parent;
            });
        }
    };

    $scope.getAddressEntryList = function (field) {
        return function(id, query, type) {
            return addressAttributeService.search(field, query);
        };
    };

    var getNextAvailableParentName = function(addressField) {
        var parent = addressField.parent;
        while(parent) {
            if(parent.name) return parent.name;
            else parent = parent.parent;
        }
    };

    $scope.getAddressDataResults = function (data) {
        return data.map(function (addressField) {
            var parentName = getNextAvailableParentName(addressField);
            return {'value': addressField.name, 'label': addressField.name + ( parentName ? ", " + parentName : "" ), addressField: addressField}
        });
    };
});