'use strict';

Bahmni.Common.AppFramework.AppDescriptor = function (context, inheritContext, retrieveUserCallback, mergeService) {
    this.id = null;
    this.instanceOf = null;
    this.description = null;
    this.contextModel = null;

    this.baseExtensionPoints = [];
    this.customExtensionPoints = [];

    this.baseExtensions = {};
    this.customExtensions = {};

    this.customConfigs = {};
    this.baseConfigs = {};

    this.extensionPath = context;
    this.contextPath = inheritContext ? context.split("/")[0] : context;

    var self = this;

    var setExtensionPointsFromExtensions = function (currentExtensions, currentExtensionPoints) {
        _.values(currentExtensions).forEach(function (extn) {
            if (extn) {
                var existing = self[currentExtensionPoints].filter(function (ep) {
                    return ep.id === extn.extensionPointId;
                });
                if (existing.length === 0) {
                    self[currentExtensionPoints].push({
                        id: extn.extensionPointId,
                        description: extn.description
                    });
                }
            }
        });
    };

    this.setExtensions = function (baseExtensions, customExtensions) {
        if (customExtensions) {
            setExtensionPointsFromExtensions(customExtensions, "customExtensionPoints");
            self.customExtensions = customExtensions;
        }
        self.baseExtensions = baseExtensions;
        setExtensionPointsFromExtensions(baseExtensions, "baseExtensionPoints");
    };

    this.setTemplate = function (template) {
        self.instanceOf = template.id;
        self.description = self.description || template.description;
        self.contextModel = self.contextModel || template.contextModel;
        if (template.configOptions) {
            _.values(template.configOptions).forEach(function (opt) {
                var existing = self.configs.filter(function (cfg) {
                    return cfg.name === opt.name;
                });
                if (existing.length > 0) {
                    existing[0].description = opt.description;
                } else {
                    self.configs.push({
                        name: opt.name,
                        description: opt.description,
                        value: opt.defaultValue
                    });
                }
            });
        }
    };

    var setConfig = function (instance, currentConfig) {
        for (var configName in instance.config) {
            var existingConfig = getConfig(self[currentConfig], configName);
            if (existingConfig) {
                existingConfig.value = instance.config[configName];
            } else {
                self[currentConfig][configName] = { name: configName, value: instance.config[configName] };
            }
        }
    };

    var setDefinitionExtensionPoints = function (extensionPoints, currentExtensionPoints) {
        if (extensionPoints) {
            extensionPoints.forEach(function (iep) {
                if (iep) {
                    var existing = self[currentExtensionPoints].filter(function (ep) {
                        return ep.id === iep.id;
                    });
                    if (existing.length === 0) {
                        self[currentExtensionPoints].push(iep);
                    }
                }
            });
        }
    };

    this.setDefinition = function (baseInstance, customInstance) {
        self.instanceOf = (customInstance && customInstance.instanceOf) ? customInstance.instanceOf : baseInstance.instanceOf;
        self.id = (customInstance && customInstance.id) ? customInstance.id : baseInstance.id;
        self.description = (customInstance && customInstance.description) ? customInstance.description : baseInstance.description;
        self.contextModel = (customInstance && customInstance.contextModel) ? customInstance.contextModel : baseInstance.contextModel;

        setDefinitionExtensionPoints(baseInstance.extensionPoints, "baseExtensionPoints");
        setConfig(baseInstance, "baseConfigs");
        if (customInstance) {
            setDefinitionExtensionPoints(customInstance.extensionPoints, "customExtensionPoints");
            setConfig(customInstance, "customConfigs");
        }
    };

    var getExtensions = function (extPointId, type, extensions) {
        var currentUser = retrieveUserCallback();
        var currentExtensions = _.values(extensions);
        if (currentUser && currentExtensions) {
            var extnType = type || 'all';
            var userPrivileges = currentUser.privileges.map(function (priv) {
                return priv.retired ? "" : priv.name;
            });
            var appsExtns = currentExtensions.filter(function (extn) {
                return ((extnType === 'all') || (extn.type === extnType)) &&
                    (extn.extensionPointId === extPointId) && (!extn.requiredPrivilege ||
                    (userPrivileges.indexOf(extn.requiredPrivilege) >= 0));
            });
            appsExtns.sort(function (extn1, extn2) {
                return extn1.order - extn2.order;
            });
            return appsExtns;
        }
    };

    this.getExtensions = function (extPointId, type, shouldMerge) {
        if (shouldMerge || shouldMerge === undefined) {
            var mergedExtensions = mergeService.merge(self.baseExtensions, self.customExtensions);
            return getExtensions(extPointId, type, mergedExtensions);
        }
        return [getExtensions(extPointId, type, self.baseExtensions), getExtensions(extPointId, type, self.customExtensions)];
    };

    this.getExtensionById = function (id, shouldMerge) {
        if (shouldMerge || shouldMerge === undefined) {
            var mergedExtensions = _.values(mergeService.merge(self.baseExtensions, self.customExtensions));
            return mergedExtensions.filter(function (extn) {
                return extn.id === id;
            })[0];
        } else {
            return [self.baseExtensions.filter(function (extn) {
                return extn.id === id;
            })[0], self.customExtensions.filter(function (extn) {
                return extn.id === id;
            })[0]];
        }
    };

    var getConfig = function (config, configName) {
        var cfgList = _.values(config).filter(function (cfg) {
            return cfg.name === configName;
        });
        return (cfgList.length > 0) ? cfgList[0] : null;
    };

    this.getConfig = function (configName, shouldMerge) {
        if (shouldMerge || shouldMerge === undefined) {
            return getConfig(mergeService.merge(self.baseConfigs, self.customConfigs), configName);
        } else {
            return [getConfig(self.baseConfigs, configName), getConfig(self.customConfigs, configName)];
        }
    };

    this.getConfigValue = function (configName, shouldMerge) {
        var config = this.getConfig(configName, shouldMerge);

        if (shouldMerge || shouldMerge === undefined) {
            return config ? config.value : null;
        }
        return config;
    };

    this.formatUrl = function (url, options, useQueryParams) {
        var pattern = /{{([^}]*)}}/g,
            matches = url.match(pattern),
            replacedString = url,
            checkQueryParams = useQueryParams || false,
            queryParameters = this.parseQueryParams();
        if (matches) {
            matches.forEach(function (el) {
                var key = el.replace("{{", '').replace("}}", '');
                var value = options[key];
                if (!value && (checkQueryParams === true)) {
                    value = queryParameters[key] || null;
                }
                replacedString = replacedString.replace(el, value);
            });
        }
        return replacedString.trim();
    };

    this.parseQueryParams = function (locationSearchString) {
        var urlParams;
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            queryString = locationSearchString || window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(queryString)) {  // eslint-disable-line no-cond-assign
            urlParams[decode(match[1])] = decode(match[2]);
        }
        return urlParams;
    };

    this.addConfigForPage = function (pageName, baseConfig, customConfig) {
        self.basePageConfigs = self.basePageConfigs || {};
        self.basePageConfigs[pageName] = baseConfig;

        self.customPageConfigs = self.customPageConfigs || {};
        self.customPageConfigs[pageName] = customConfig;
    };

    this.getConfigForPage = function (pageName, shouldMerge) {
        if (shouldMerge || shouldMerge === undefined) {
            return mergeService.merge(self.basePageConfigs[pageName], self.customPageConfigs[pageName]);
        }
        return [_.values(self.basePageConfigs[pageName]), _.values(self.customPageConfigs[pageName])];
    };
};
