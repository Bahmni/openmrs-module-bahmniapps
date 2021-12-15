"use strict";

function SampleComponent () {
    const [count, setCount] = React.useState(0);

    function click () {
        console.log(window.location.href);
        setCount(count + 1);
    }

    return /* #__PURE__ */React.createElement("button", {
        onClick: click
    }, "Medications: ", count);
}

ReactDOM.render(/* #__PURE__ */React.createElement(SampleComponent, null), document.querySelector("#sample-app"));

