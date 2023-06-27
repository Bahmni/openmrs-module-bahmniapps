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
