'use strict';

angular.module('bahmni.reports')
    .controller('ReportsController', ['$scope', '$filter', 'appService', 'reportService', 'FileUploader', 'messagingService', 'spinner', '$rootScope', '$translate', 'auditLogService', '$log', function ($scope, $filter, appService, reportService, FileUploader, messagingService, spinner, $rootScope, $translate, auditLogService, $log) {
        const format = _.values(reportService.getAvailableFormats());
        const dateRange = _.values(reportService.getAvailableDateRange());

        var getTranslatedMessage = function (key) {
            return $translate.instant(key);
        };

        $scope.uploader = new FileUploader({
            url: Bahmni.Common.Constants.uploadReportTemplateUrl,
            removeAfterUpload: true,
            autoUpload: true
        });
        $scope.uploader.onSuccessItem = function (fileItem, response) {
            fileItem.report.reportTemplateLocation = response;
        };

        $rootScope.default = $rootScope.default || {
            reportsRequiringDateRange: {
                responseType: format[1],
                dateRangeType: dateRange[0],
                startDate: dateRange[0],
                stopDate: dateRange[0],
                report: { responseType: format[1] }
            },
            reportsNotRequiringDateRange: {}
        };

        $scope.reportsDefined = true;
        $scope.enableReportQueue = appService.getAppDescriptor().getConfigValue("enableReportQueue");

        $scope.setDefault = function (item, header) {
            var setToChange = (header === 'reportsRequiringDateRange') ? $rootScope.reportsRequiringDateRange : $rootScope.reportsNotRequiringDateRange;
            var isPreviousMonth = $rootScope.default[header][item] === dateRange[2];
            for (var i = 0; i < setToChange.length; i++) {
                var report = setToChange[i];
                if (item === 'dateRangeType') {
                    $rootScope.default.reportsRequiringDateRange.startDate = $rootScope.default[header][item];
                    $rootScope.default.reportsRequiringDateRange.stopDate = isPreviousMonth ? getPreviousMonthEndDate() : dateRange[0];
                    report.startDate = $rootScope.default[header][item];
                    report.stopDate = isPreviousMonth ? getPreviousMonthEndDate() : dateRange[0];
                } else if (_.isUndefined($rootScope.default[header][item])) {
                    $rootScope.default.reportsRequiringDateRange.startDate = dateRange[0];
                    $rootScope.reportsRequiringDateRange.forEach(function (report) {
                        report.startDate = $filter('date')(dateRange[0], 'yyyy-MM-dd');
                        report.stopDate = isPreviousMonth ? getPreviousMonthEndDate() : dateRange[0];
                        report.responseType = format[1];
                    });
                    break;
                } else {
                    report[item] = $rootScope.default[header][item];
                }
            }
        };

        var getPreviousMonthEndDate = function () {
            return new Date(new Date().getFullYear(), new Date().getMonth(), 0);
        };

        var isDateRangeRequiredFor = function (report) {
            return _.find($rootScope.reportsRequiringDateRange, { name: report.name });
        };

        var validateReport = function (report) {
            if (!report.responseType) {
                messagingService.showMessage("error", "Select format for the report: " + report.name);
                return false;
            }
            if (report.responseType === 'application/vnd.ms-excel-custom' && !report.reportTemplateLocation) {
                if (!report.config.macroTemplatePath) {
                    messagingService.showMessage("error", "Workbook template should be selected for generating report: " + report.name);
                    return false;
                }
                report.reportTemplateLocation = report.config.macroTemplatePath;
            }
            report.startDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.startDate);
            report.stopDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.stopDate);
            if (isDateRangeRequiredFor(report) && (!report.startDate || !report.stopDate)) {
                var msg = [];
                if (!report.startDate) {
                    msg.push("start date");
                }
                if (!report.stopDate) {
                    msg.push("end date");
                }
                if ((report.startDate > report.stopDate)) {
                    msg.push(getTranslatedMessage("START_DATE_CANNOT_LATER_THAN_STOP_DATE"));
                }
                messagingService.showMessage("error", "Please select the " + msg.join(" and "));
                return false;
            }
            if (report.type === 'concatenated' && report.responseType === reportService.getMimeTypeForFormat('CSV')) {
                messagingService.showMessage('error', 'CSV format is not supported for concatenated reports');
                return false;
            }
            return true;
        };

        $scope.downloadReport = function (report) {
            if (validateReport(report)) {
                reportService.generateReport(report);
                if (report.responseType === 'application/vnd.ms-excel-custom') {
                    report.reportTemplateLocation = undefined;
                    report.responseType = _.values($scope.formats)[0];
                }
                log(report.name);
            }
        };

        var log = function (reportName) {
            auditLogService.log(undefined, 'RUN_REPORT', { reportName: reportName }, "MODULE_LABEL_REPORTS_KEY");
        };

        $scope.scheduleReport = function (report) {
            if (validateReport(report)) {
                spinner.forPromise(reportService.scheduleReport(report)).then(function () {
                    messagingService.showMessage("info", report.name + " added to My Reports");
                }, function () {
                    messagingService.showMessage("error", "Error in scheduling report");
                });
                if (report.responseType === 'application/vnd.ms-excel-custom') {
                    report.reportTemplateLocation = undefined;
                    report.responseType = _.values($scope.formats)[0];
                }
                log(report.name);
            }
        };

        var initializeFormats = function () {
            var supportedFormats = appService.getAppDescriptor().getConfigValue("supportedFormats") || _.keys(reportService.getAvailableFormats());
            supportedFormats = _.map(supportedFormats, function (format) {
                return format.toUpperCase();
            });
            $scope.formats = _.pick(reportService.getAvailableFormats(), supportedFormats);
        };

        var initializeDateRange = function () {
            var supportedDateRange = appService.getAppDescriptor().getConfigValue("supportedDateRange") || _.keys(reportService.getAvailableDateRange());
            $scope.dateRange = _.pick(reportService.getAvailableDateRange(), supportedDateRange);
        };

        // Grouping configuration - matches reports by keywords in their names
        var getReportGroup = function (reportName) {
            var name = reportName.toLowerCase();

            // Group 1: ACUTE EPISODIC CARE/MINOR AILMENTS
            // Sub1: Epidemic care
            if (name.includes('epidemic') || name.includes('minor ailment') || name.includes('family planning') ||
                name.includes('pregnancy') || name.includes('community screening') || name.includes('universal test') ||
                 name.includes('mc') || name.includes('srh')) {
                return { mainGroup: 1, subGroup: 'Epidemic Care' };
            }
            // Sub2: Medical emergency
            if (name.includes('emergency') || name.includes('emerg')) {
                return { mainGroup: 1, subGroup: 'Medical Emergency' };
            }

            // Group 2: CHRONIC CARE
            // Sub1: HIV
            if (name.includes('art') || name.includes('hiv') || name.includes('wellness') ||
                name.includes('pre-art') || name.includes('initiation') || name.includes('hts')) {
                return { mainGroup: 2, subGroup: 'HIV' };
            }
            // Sub2: TB
            if (name.includes('tb') || name.includes('tuberculosis') || name.includes('ipt') ||
                name.includes('mdr') || name.includes('drug sensitive')) {
                return { mainGroup: 2, subGroup: 'TB' };
            }
            // Sub3: NCDs
            if (name.includes('diabetes') || name.includes('hypertension') || name.includes('cardiovascular') ||
                name.includes('cardio') || name.includes('asthma') || name.includes('epilepsy') ||
                name.includes('ncd')) {
                return { mainGroup: 2, subGroup: 'NCDs' };
            }

            // Group 3: PREVENTIVE/PROMOTIVE CARE
            // Sub1: Maternal health
            if (name.includes('antenatal') || name.includes('postnatal') || name.includes('post natal') ||
                name.includes('maternal')) {
                return { mainGroup: 3, subGroup: 'Maternal Health' };
            }
            // Sub2: Reproductive health
            if (name.includes('top') || name.includes('termination') || name.includes('sterilisation') ||
                name.includes('sterilization') || name.includes('mmc') || name.includes('reproductive')) {
                return { mainGroup: 3, subGroup: 'Reproductive Health' };
            }
            // Sub3: Child health
            if (name.includes('well-baby') || name.includes('well baby') || name.includes('immunisation') ||
                name.includes('immunization') || name.includes('child health')) {
                return { mainGroup: 3, subGroup: 'Child Health' };
            }

            // Group 4: HEALTH SUPPORT SERVICES (check before general mental health)
            if (name.includes('oral health') || name.includes('dental') || name.includes('physical therapy') ||
                name.includes('physio') || name.includes('occupational') || name.includes('podiatry') ||
                name.includes('speech') || name.includes('hearing') || name.includes('psychiatrist') ||
                name.includes('psychologist') || name.includes('mental health nurse') || name.includes('mental health team')) {
                return { mainGroup: 4, subGroup: 'Health Support Services' };
            }

            // Sub4: Mental health (chronic care) - after health support services check
            if (name.includes('mental health') || name.includes('mental')) {
                return { mainGroup: 2, subGroup: 'Mental Health' };
            }

            // Lab
            if (name.includes('lab') || name.includes('laboratory')) {
                return { mainGroup: 4, subGroup: 'Lab' };
            }

            // Pharmacy
            if (name.includes('pharmacy') || name.includes('phar') || name.includes('pharmacy stock')) {
                return { mainGroup: 4, subGroup: 'Pharmacy' };
            }

            // Supply Chain
            if (name.includes('supply chain') || name.includes('supplychain')) {
                return { mainGroup: 4, subGroup: 'Supply Chain' };
            }

            // Other - uncategorized
            return { mainGroup: 5, subGroup: 'Other' };
        };

        // Get user roles and log them
        var getUserRoles = function () {
            if (!$rootScope.currentUser || !$rootScope.currentUser.roles) {
                $log.log('ReportsController: No user roles found');
                return [];
            }
            var roles = _.map($rootScope.currentUser.roles, function (role) {
                return role.name;
            });
            $log.log('ReportsController: User roles:', roles);
            return roles;
        };

        // Convert group name to role name
        // Examples: "Epidemic Care" -> "Reports-Epidemic-Care", "HIV" -> "Reports-HIV"
        var getRoleNameForGroup = function (groupName) {
            // Replace spaces with hyphens and prefix with "Reports-"
            return 'Reports-' + groupName.replace(/\s+/g, '-');
        };

        // Check if user has required role for a group
        var hasRoleForGroup = function (groupName, userRoles) {
            var requiredRole = getRoleNameForGroup(groupName);
            return _.includes(userRoles, requiredRole);
        };

        // Group reports by category
        var groupReports = function (reports) {
            var grouped = {};
            var userRoles = getUserRoles();

            reports.forEach(function (report) {
                var group = getReportGroup(report.name);
                var key = group.subGroup;

                // Check if user has permission to see this group
                if (!hasRoleForGroup(key, userRoles)) {
                    return; // Skip this report if user doesn't have the required role
                }

                if (!grouped[key]) {
                    grouped[key] = {
                        subGroupName: key,
                        mainGroup: group.mainGroup,
                        reports: []
                    };
                }
                grouped[key].reports.push(report);
            });

            // Convert to array and sort by main group, then by subgroup name
            var groupedArray = _.values(grouped);
            groupedArray.sort(function (a, b) {
                if (a.mainGroup !== b.mainGroup) {
                    return a.mainGroup - b.mainGroup;
                }
                return a.subGroupName.localeCompare(b.subGroupName);
            });

            return groupedArray;
        };

        var initialization = function () {
            $log.log('ReportsController: LOADING...');

            // Log current user information for debugging
            if ($rootScope.currentUser) {
                $log.log('ReportsController: Current user:', $rootScope.currentUser.username);
                $log.log('ReportsController: User roles object:', $rootScope.currentUser.roles);
                if ($rootScope.currentUser.roles) {
                    var roleNames = _.map($rootScope.currentUser.roles, function (role) {
                        return role.name;
                    });
                    $log.log('ReportsController: User role names:', roleNames);
                } else {
                    $log.log('ReportsController: User roles property is undefined or null');
                }
            } else {
                $log.log('ReportsController: No current user found in $rootScope');
            }

            var reportList = appService.getAppDescriptor().getConfigForPage("reports");

            var allReportsRequiringDateRange = _.isUndefined($rootScope.reportsRequiringDateRange) ? _.values(reportList).filter(function (report) {
                return !(report.config && report.config.dateRangeRequired === false);
            }) : $rootScope.reportsRequiringDateRange;

            var allReportsNotRequiringDateRange = _.isUndefined($rootScope.reportsNotRequiringDateRange) ? _.values(reportList).filter(function (report) {
                return (report.config && report.config.dateRangeRequired === false);
            }) : $rootScope.reportsNotRequiringDateRange;

            // Group reports (this will filter based on roles)
            $scope.groupedReportsRequiringDateRange = groupReports(allReportsRequiringDateRange);
            $scope.groupedReportsNotRequiringDateRange = groupReports(allReportsNotRequiringDateRange);

            // Keep original arrays for backward compatibility if needed
            $rootScope.reportsRequiringDateRange = allReportsRequiringDateRange;
            $rootScope.reportsNotRequiringDateRange = allReportsNotRequiringDateRange;

            $scope.reportsDefined = _.values(reportList).length > 0;

            initializeFormats();
            initializeDateRange();
        };

        initialization();
    }]);
