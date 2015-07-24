Bahmni Apps
============

Medical Front-end for Bahmni. 

[![Build Status](https://travis-ci.org/Bhamni/openmrs-module-bahmniapps.svg?branch=master)](https://travis-ci.org/Bhamni/openmrs-module-bahmniapps)

Instructions
============
Please see https://bahmni.atlassian.net/wiki/display/BAH/Working+on+Bahmni+OpenMRS+frontend


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
