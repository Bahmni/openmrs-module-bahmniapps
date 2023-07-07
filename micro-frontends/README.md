# bahmni-carbon-ui

## Next Gen UI library for Bahmni

This is the UI component library for Bahmni and OpenMRS, built on top of Carbon Design system.

### Notes on local link

To use a local copy of this lib with your project run the following commands

```bash
cd <project dir>/node_modules/react
yarn link
cd ../react-dom
yarn link

cd <bahmni-carbon-ui dir>
yarn link
yarn link react
yarn link react-dom

cd <project dir>
yarn link bahmni-carbon-ui
```

### Debug changes
#### build
```
$ yarn build
```

The build output is generated into `../ui/app/micro-frontends-dist/`. This is done so that the 
main bahmni-apps can reference the built files from there


## Understanding the build output
Here is a description of all the files built

```
<mfe-name>.min.js         // angular module containing components from a single mfe
<mfe-name>.min.css        // all the CSS for a given mfe

mfe_polyfills_angular_1_4.min.js    // a polyfill required to load any <mfe-name>.min.js
```

Currently, we only have the `ipd.min.js` and `ipd.min.css`;
