basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  '../app/lib/angular/angular.js',
  '../app/lib/angular/angular-*.js',
  '../lib/angular/angular-mocks.js',
  '../app/modules/**/*.js',
  '../unit/**/*.js'
];

singleRun = true;

browsers = ['PhantomJS'];

reporters = ['dots', 'junit'];
junitReporter = {
  outputFile: 'output/unit.xml',
  suite: 'unit'
};
