Bahmni.ConceptSet.ConceptSetSection = function(options) {
    var self = this;
    self.options = options || {};
    self.isOpen = false;

    var getShowIfFunction = function(extension) {
        if(!self.showIfFunction) {
            var showIfFunctionStrings = self.options.showIf || ["return true;"];
            self.showIfFunction = new Function("context", showIfFunctionStrings.join('\n'));
        }
        return self.showIfFunction;
    }

    self.isAvailable = function(context) {
        return getShowIfFunction()(context);
    }

    self.toggle = function() {
        if(self.isOpen) {
            self.hide();
        } else {
            self.show();
        }
    }

    self.show = function() {
        self.isOpen = true;
        self.isLoaded = true;
    }

    self.hide = function() {
        self.isOpen = false;
    }
}