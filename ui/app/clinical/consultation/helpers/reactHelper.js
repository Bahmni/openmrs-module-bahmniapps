var ReactHelper = {
    createReactComponent: function (component, props) {
        return React.createElement(component, props);
    },
    renderReactComponent: function (component, rootId) {
        ReactDOM.render(component, document.getElementById(rootId));
    }

};
