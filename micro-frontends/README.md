# Bahmni Micro-Frontends

This directory of bahmniapps contains a webpack build system to package the various react
micro-frontends (mfe) available.

## Find detailed documentation on the Wiki
1. [Architecture of Bahmni micro-frontends](https://bahmni.atlassian.net/wiki/spaces/BAH/pages/3210477602/Micro-frontends+MFE+architecture+for+UI)
2. [How to add/edit/integrate Bahmni micro-frontends](https://bahmni.atlassian.net/wiki/spaces/BAH/pages/3211755555/How+to+implement+micro-frontends)

### Important commands
#### install all dependencies
```
$ yarn install
```

#### Test
```
$ yarn test
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
i18n                      // Directory that containes all the translations
shared.min.js             // Contains shared JS across microfrontends. should be loaded first
shared.min.css            // Contains shared CSS across microfrontends including the carbon stylesheet. should be loaded first  

<mfe-name>.min.js         // angular module containing components from a single mfe
<mfe-name>.min.css        // all the CSS for a given mfe
```

Currently, we have the following micro-frontends

1. `next-ui.min.js`: A local micro-fontend containing next gen react components to be used by bahmniapps
2. `ipd.min.js`: The IPD micro-frontend talking to the remote IPD repository

All the translations residing in `public` are copied as such and made available in the `micro-frontends-dist`.

### Other notes
1. For every micro-frontend angular module, don't forget to add an entry in the `ui/test/__mocks__/micro-frontends.js` file for mocking it out