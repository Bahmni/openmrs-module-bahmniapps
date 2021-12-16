describe('microFrontendLoader', function () {

    function attachContainers() {
        let rootElement = document.createElement('div')
        let container1 = document.createElement('div')
        container1.setAttribute("mf-container", "test-container-1")
        rootElement.appendChild(container1)
        let container2 = document.createElement('div')
        container2.setAttribute("mf-container", "test-container-2")
        rootElement.appendChild(container2)
        document.body.appendChild(rootElement);
    }

    it("should render mf in appropriate containers", async function (done) {
        attachContainers();
        setTimeout(function () {
            expect(document.body.querySelector("#test-mf1").querySelector("#test-mf1-element")).not.toBeNull();
            expect(document.body.querySelector("#test-mf2").querySelector("#test-mf2-element")).not.toBeNull();
            expect(document.body.querySelector("#test-mf3")).toBeNull();
            done();
        }, 100);
    });
});
