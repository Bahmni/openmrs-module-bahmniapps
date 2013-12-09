#Bhamni OPD

This application will help doctors capture data in OPD. 

 (copied from registration module)
To set up the application, do the following

1. Install the following modules required globally (This is a one time task)

  npm install -g bower
  npm install -g grunt-cli
  gem intall compass

2. Set up local node dependencies. (This installs all the node
dependencies into node_modules.

  npm install


3. Set up UI component/dependencies (This installs all the UI dependencies into
app/components)

  bower install


4.To get nginfiniteScroll run the following

  bower install ngInfiniteScroll

Project Structure
-----------------
<pre>
├── app (Entire webapp, source code)
│   ├── components (All front end components)
│   │   ├── angular
│   │   └── ...
│   ├── modules (Application code modules, with own js/html views)
│   │   ├── patient
│   │   │   ├── controllers
│   │   │   ├── mappers
│   │   │   ├── models
│   │   │   ├── services
│   │   │   └── views
│   │   └── ...
│   ├── lib (Front end components checked into code, not pulled in via bower)
│   │   ├── jquery-ui
│   │   └── ...
│   ├── images (All app images)
│   ├── scripts (JS code)
│   └── styles (All styling code)
│   │   ├── .css (Compass generated CSS files go in here.)
│   │   ├── print.css
│   │   └── ...
│   └── index.html (Main entry HTML file)
|
├── dist (This is the package folder. Similar to a jar)
│   ├── components (Copied verbatim from app)
│   │   ├── angular
│   │   └── ...
│   ├── images (Copied verbatim from app)
│   ├── lib (Copied verbatim from app)
│   │   ├── bootstrap-2.3.0
│   │   └── ...
│   ├── modules (Only copy the .html over, JS passes through a separate filter.
│   │   ├── patient
│   │   │   └── views
│   │   └── ...
│   ├── scripts (Has all the optimized JS here.)
│   └── styles
│       └── css (Has all the optimized CSS here.)
|
├── node_modules (This holds all the back end modules. )
|
├── logs
├── scripts
└── test
    ├── config (Karma config)
    ├── e2e
    ├── output (Results of test run)
    ├── support (Test support code)
    └── unit (Test code folder)
</pre>
