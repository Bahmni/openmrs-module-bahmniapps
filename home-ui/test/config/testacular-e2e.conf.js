basePath = '../';

files = [
  ANGULAR_SCENARIO,
  ANGULAR_SCENARIO_ADAPTER,
  'e2e/**/*.js'
];

autoWatch = false;

browsers = ['Chrome'];

singleRun = true;

proxies = {
  '/': 'http://localhost:8000/'
};

junitReporter = {
  outputFile: 'output/e2e.xml',
  suite: 'e2e'
};
