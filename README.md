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
5. All Epics, Stories, Bugs, etc are tracked in [JIRA: Volunteer Board](https://bahmni.atlassian.net/secure/RapidBoard.jspa?rapidView=25&projectKey=BAH&quickFilter=66).
6. To Run Bahmni locally you should use Docker option of Bahmni or Vagrant option. Docker is recommended.

# Build

### Notes
1. This build requires Node, npm, yarn, grunt and compass (ruby).
2. You can see the [Github Action Build](https://github.com/Bahmni/openmrs-module-bahmniapps/actions/workflows/build_publish.yml) to see what commands get executed.

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
   - Ruby version: 3.1
   - Once ruby is installed, you can install compass using: `gem install compass`

### Build commands

**NOTE:**
Run these commands from within the `micro-frontends` sub-folder
1. `yarn install`
2. `yarn build`
3. If build is successful, the `../ui/app/micro-frontends-dist` folder has the set of files which can be used by the angular modules for their build

Run these commands from within the `ui` sub-folder.

1. `yarn install`
2. `yarn ci` (will internally trigger grunt)
3. If build is successful, the `dist` folder has the set of files to be deployed in Apache (or in Vagrant).

### Docker (Hot Deploy)

1. If you are using Bahmni Docker, then you can hot deploy your app by following these steps: [Bahmni Web Configurations Docker (Wiki)](https://bahmni.atlassian.net/wiki/spaces/BAH/pages/3117449349/Bahmni-Web+Configurations+docker)

### Vagrant (Hot Deploy)

1. You can also sym-link the `/var/www/bahmniapps` folder in Vagrant to `{CODE_DIR}/ui/app/` folder so that JS changes are reflected immediately.


### Debugging AngularJS App

1. To be able to debug Bahmni frontend please read this post: [Debugging AngularJS](https://www.newline.co/ng-book/p/Debugging-AngularJS/)
2. If you are brand new to AngularJS, this is a good intro video: [Youtube: 60 min overview of AngularJS Fundamentals](http://www.youtube.com/watch?v=i9MHigUZKEM)

## Bahmniapps (bahmni-web) docker image

Docker images for [Bahmniapps](https://hub.docker.com/r/bahmni/bahmni-web/tags) is built using [Github Actions](/.github/workflows).

Resources to build the following docker images can be found in the [package](/package) directory.

## Prevent Search Engines from Indexing the homepage


>⚠️ : Search Engines are able to index the Bahmni App homepage. 

This behaviour can be prevented by:

1. **Adding a “noindex” metatag:**

   The following tag should be inserted in the `<head>` section of the homepage's HTML markup:

   ```
   <meta name=”robots” content=”noindex”>
   ```

   Additionally, in order to both _de-index_ the homepage and not follow the links, use the `noindex` with the `nofollow` metatag:

   ```
   <meta name=”robots” content=”noindex,nofollow”>
   ```

   > The same is already done [here](https://github.com/Bahmni/openmrs-module-bahmniapps/blob/master/package/docker/index.html#L5)
   >
2. **Using an X-ROBOTS-TAG HTTP HEADER:**

   An `X-Robots-Tag` can be added to the HTTP response header. It has basically the same effect as a `noindex` tag, but with the additional options to specify conditions for different search engines. For more information, please see Google’s guide [here](https://developers.google.com/search/docs/advanced/robots/robots_meta_tag). Here are examples of X-Robots-Tag for specific functions:

   - To de-index a web page:

   ```
   Header set X-Robots-Tag "noindex, nofollow"
   ```

   > The same is already done [here](https://github.com/Bahmni/openmrs-module-bahmniapps/blob/master/package/docker/httpd.conf#L32)
   >

### SNOMED Integration Support

openmrs-module-bahmniapps also integrates with SNOMED for terminology lookup and CDSS. More details can be found in [this](https://bahmni.atlassian.net/wiki/spaces/BAH/pages/3132686337/SNOMED+FHIR+Terminology+Server+Integration+with+Bahmni) Wiki link