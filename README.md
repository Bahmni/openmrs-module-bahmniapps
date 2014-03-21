Bhamni Apps
============

This application contains Bahmni apps for openmrs.

 To set up the application, do the following in ui folder

1. Install the following modules required globally (This is a one time task)

  `npm install -g bower`
  `npm install -g grunt-cli`
  `gem install compass`

2. Install node dependencies (Installed into node_modules).

  `npm install`


3. Set up UI component/dependencies (This installs all the UI dependencies into
app/components)

  `bower install`

4. Build the application (into dist folder) using Grunt

  `grunt`

5. For creating a symlink into your vagrant /var/www:  

  `./scripts/vagrant-link.sh` (links app folder)
  `./scripts/vagrant-link.sh dist` (links dist folder)



Project Structure
-----------------
<pre>
|-- api
|   |-- pom.xml
|   `-- src
|       `-- main
|-- omod
|   |-- pom.xml
|   `-- src
|       `-- main
|           |-- resources
|               |-- config.xml
|               |-- liquibase.xml
|               |-- package.sh
|               `-- webModuleApplicationContext.xml
`-- ui
    |-- Gruntfile.js
    |-- app
    |   |-- adt
    |   |-- clinical
    |   |-- common
    |   |-- components
    |   |-- document-upload
    |   |-- home
    |   |-- images
    |   |-- lib
    |   |-- orders
    |   |-- registration
    |   |-- styles
    |   `-- trends
    |-- bower.json
    |-- build.sh
    |-- package.json
    `-- scripts
        `-- package.sh
</pre>