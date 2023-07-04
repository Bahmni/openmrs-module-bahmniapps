# Bahmni Micro-Frontends

This directory of bahmniapps contains a webpack build system to package the various react
micro-frontends (mfe) available.

### Important commands
#### install all dependencies
```
$ yarn install
```

#### build
```
$ yarn build
```

The build output is generated into `../ui/app/common/mfe-build/`. This is done so that the 
main bahmni-apps can reference the built files from there


## Understanding the build output
Here is a description of all the files built

```
<mfe-name>.min.js         // angular module containing components from a single mfe
<mfe-name>.min.css        // all the CSS for a given mfe

mfe_polyfills_angular_1_4.min.js    // a polyfill required to load any <mfe-name>.min.js
```

Currently, we only have the `ipd.min.js` and `ipd.min.css`;