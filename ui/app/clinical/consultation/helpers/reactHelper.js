var ReactHelper = {
    createReactComponent: function (component, props) {
        return React.createElement(component, props);
    },
    renderReactComponent: function (component, rootId) {
        return ReactDOM.render(component, document.getElementById(rootId));
    }

};
