module.exports = function (config) {
    config.set({
        basePath: '../..',
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        autoWatch: true,
        singleRun: false,
        files: [
            'app/components/q/q.js',
            'app/components/angular/angular.js',
            'app/components/angular-route/angular-route.js',
            'app/components/angular-mocks/angular-mocks.js',
            'app/components/ngInfiniteScroll/build/ng-infinite-scroll.js',
            'app/components/d3/d3.min.js',
            'app/components/nvd3/nv.d3.min.js',
            'app/components/angularjs-nvd3-directives/dist/*.js',
            'app/components/moment/moment.js',
            'app/components/angular-ui-router/release/angular-ui-router.js',
            'app/components/lodash/dist/lodash.min.js',
            'app/components/angular-ui-select2/src/select2.js',
            'app/components/angular-bindonce/bindonce.js',
            'app/common/constants.js',
            'app/**/init.js',
            'app/**/constants.js',
            'app/common/**/*.js',
            'app/adt/**/*.js',
            'app/clinical/**/*.js',
            'app/document-upload/**/*.js',
            'app/orders/**/*.js',
            'app/home/**/*.js',
            'app/registration/**/*.js',
            'app/trends/**/*.js',
            'test/support/**/*.js',
            'test/unit/**/*.js'
            ],
        reporters: ['dots', 'junit'],
        junitReporter: {
            outputFile: 'output/unit.xml',
            suite: 'unit'
        }
    });
};



