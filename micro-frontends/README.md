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

The build output is generated into `../ui/app/micro-frontends-dist/`. This is done so that the 
main bahmni-apps can reference the built files from there


## Understanding the build output
Here is a description of all the files built

```
shared.min.js             // Contains shared JS across microfrontends. should be loaded first
shared.min.css            // Contains shared CSS across microfrontends including the carbon stylesheet. should be loaded first  

<mfe-name>.min.js         // angular module containing components from a single mfe
<mfe-name>.min.css        // all the CSS for a given mfe
```

Currently, we have the following micro-frontends

1. `next-ui.min.js`: A local micro-fontend containing next gen react components to be used by bahmniapps
2. `ipd.min.js`: The IPD micro-frontend talking to the remote IPD repository