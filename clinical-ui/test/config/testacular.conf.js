basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
    '../app/components/angular/angular.js',
    '../app/components/angular-route/angular-route.js',
    '../app/components/angular-mocks/angular-mocks.js',
    '../app/components/ngInfiniteScroll/ng-infinite-scroll.js',
    '../app/components/d3/d3.min.js',
    '../app/components/nvd3/nv.d3.min.js',
    '../app/components/angularjs-nvd3-directives/dist/*.js',
    '../app/components/moment/moment.js',
    '../app/common/constants.js',
    '../app/**/modules/**/init.js',
    '../app/**/constants.js',
    '../app/**/modules/**/*.js',
    '../app/**/modules/**/constants.js',
    '../app/trends/**/*.js',
    'support/**/*.js',
    'unit/**/*.js'
];

singleRun = true;

browsers = ['PhantomJS'];

reporters = ['dots', 'junit'];
junitReporter = {
  outputFile: 'output/unit.xml',
  suite: 'unit'
};
