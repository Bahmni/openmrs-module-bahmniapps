'use strict';

Bahmni.Clinical.Selectable = function (data, selectableChildren, onSelectionChange) {
    angular.extend(this, data);
    var selectionSources = [];
    var children = selectableChildren || [];
    onSelectionChange = onSelectionChange || angular.noop;

    this.isSelected = function () {
        return selectionSources.length > 0;
    };

    this.isSelectedFromSelf = function () {
        return selectionSources.indexOf(this) !== -1;
    };

    this.isSelectedFromOtherSource = function () {
        return this.isSelected() && !this.isSelectedFromSelf();
    };

    this.addChild = function (selectable) {
        children.push(selectable);
    };

    this.getChildrenCount = function () {
        return children.length;
    };

    this.toggle = function (selectionSource) {
        if (this.isSelected()) {
            this.unselect(selectionSource);
        } else {
            this.select(selectionSource);
        }
    };

    this.select = function (selectionSource) {
        selectionSource = selectionSource || this;
        if (selectionSources.indexOf(selectionSource) === -1) {
            selectionSources.push(selectionSource);
            angular.forEach(children, function (child) {
                child.unselect(child);
                child.select(selectionSource);
            });
            onSelectionChange(this);
        }
    };

    this.unselect = function (selectionSource) {
        selectionSource = selectionSource || this;
        var index = selectionSources.indexOf(selectionSource);
        if (index !== -1) {
            selectionSources.splice(index, 1);
            angular.forEach(children, function (child) { child.unselect(selectionSource); });
            onSelectionChange(this);
        }
    };
};
