This is a forked repo from bahmni/openmrs-module-bahmniapps and have changes required for ABDM pop-up and other features.

# Bahmni Apps

[![Build Status](https://travis-ci.org/Bahmni/openmrs-module-bahmniapps.svg?branch=master)](https://travis-ci.org/Bahmni/openmrs-module-bahmniapps)

[![Build and Publish](https://github.com/Bahmni/openmrs-module-bahmniapps/actions/workflows/build_publish.yml/badge.svg)](https://github.com/Bahmni/openmrs-module-bahmniapps/actions/workflows/build_publish.yml)

1. This repository contains most of the frontend code for the **Bahmni EMR**. It is written in **AngularJS** with
   only the Form viewer part utilising _React_.
2. See the sub-folder: `ui/app/` to understand which all modules of the EMR UI are contained in this codebase.
3. Regarding the decision of migrating away from AngularJS and instead use React, please read this
   blog writeup: [Bahmni EMR - 1 M lines of code](https://medium.com/bahmni-blog/bahmni-emr-1million-lines-of-open-source-code-87e610e9a4ec)
4. This code needs help in migrating to React. If you are interested in helping, please ping the
   Bahmni team on Slack (`#community` channel).
5. All Epics, Stories, Bugs, etc are tracked in [JIRA](https://bahmni.atlassian.net/secure/RapidBoard.jspa?rapidView=25&projectKey=BAH&quickFilter=66).
6. To Run Bahmni locally you will need a Vagrant setup. See this [documentation](https://bahmni.atlassian.net/wiki/spaces/BAH/pages/14712841/Bahmni+Virtual+Box).

# Build

1. This build requires Node, npm, yarn, grunt and compass.
2. You can see the [travis-ci build](https://travis-ci.org/Bahmni/openmrs-module-bahmniapps) to understand the build commands that get executed.
3. You can also see the go-cd build [Bahmni_MRS_v0_93](https://ci-server.mybahmni.org/go/tab/build/detail/Bahmni_MRS_v0_93/Latest/BuildStage/1/BahmniApps) pipeline to see in-depth build steps.

### One time installation:

These steps need to performed ONLY the FIRST TIME you set up this code.

1. Install node/npm (node version: 10.11.0). Preferably use nvm, so that you have control over which project uses which version of node. See:
   - [how to install Node using nvm](https://github.com/nvm-sh/nvm).
   - [how to install NodeJS on mac](https://www.newline.co/@Adele/how-to-install-nodejs-and-npm-on-macos--22782681).
2. Install Yarn: `npm install -g yarn`
3. Install Grunt: `npm install -g grunt-cli`
4. Install Compass:
   - Compass compiles SASS/SCSS into CSS.
   - Requires ruby (It's recommended to install ruby also using rvm. See install [rvm with ruby](https://stackify.com/rvm-how-to-get-started-and-manage-your-ruby-installations/)).
   - Ruby version: 2.6.6
   - Once ruby is installed, you can install compass using: `gem install compass`

### Build commands

Run these commands from within the `ui` sub-folder.

1. `yarn install`
2. `yarn ci` (will internally trigger grunt)
3. If build is successful, the `dist` folder has the set of files to be deployed in Apache (or in Vagrant).

### Vagrant (Hot Deploy)

1. You can also sym-link the `/var/www/bahmniapps` folder in Vagrant to `{CODE_DIR}/ui/app/` folder so that JS changes are reflected immediately.

### Debugging AngularJS App

1. To be able to debug Bahmni frontend please read this post: [Debugging AngularJS](https://www.newline.co/ng-book/p/Debugging-AngularJS/)
2. If you are brand new to AngularJS, this is a good intro video: [Youtube: 60 min overview of AngularJS Fundamentals](http://www.youtube.com/watch?v=i9MHigUZKEM)

## Bahmniapps (bahmni-web) docker image

Docker images for [Bahmniapps](https://hub.docker.com/r/bahmni/bahmni-web/tags) is built using [Github Actions](/.github/workflows).

Resources to build the following docker images can be found in the [package](/package) directory.
