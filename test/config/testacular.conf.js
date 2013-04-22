basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  '../app/lib/angular/angular.js',
  'lib/angular/angular-mocks.js',
  '../app/defaults.js',
  '../app/constants.js',
  '../app/modules/**/*.js',
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
