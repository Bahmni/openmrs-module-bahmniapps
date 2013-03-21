basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  '../app/lib/angular/angular.js',
  '../app/lib/angular/angular-*.js',
  'lib/angular/angular-mocks.js',
  '../app/modules/**/*.js',
  'unit/**/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
  outputFile: 'output/unit.xml',
  suite: 'unit'
};
