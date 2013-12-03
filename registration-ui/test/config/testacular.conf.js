basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    '../app/components/angular/angular.js',
    '../app/components/moment/moment.js',
    '../app/components/jquery/jquery.js',
    '../app/components/angular-mocks/angular-mocks.js',
    '../app/components/ngInfiniteScroll/ng-infinite-scroll.js',
    '../app/scripts/**/*.js',
    '../app/modules/**/init.js',
    '../app/modules/**/*.js',
    'support/**/*.js',
    'unit/**/*.js'
];

singleRun = true;

browsers = ['Chrome'];

reporters = ['dots', 'junit'];
junitReporter = {
    outputFile: 'output/unit.xml',
    suite: 'unit'
};
