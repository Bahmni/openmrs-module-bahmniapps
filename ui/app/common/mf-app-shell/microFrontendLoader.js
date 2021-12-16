const cleanUpContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

const createDOM = function (container, mfName) {
    let dom = document.createElement('div');
    dom.id = mfName;
    container.appendChild(dom);
};

const loadApp = function (container, mf) {
    for (const scriptURL of mf.urls) {
        let scriptTag = document.createElement('script');
        scriptTag.src = scriptURL;
        container.appendChild(scriptTag);
    }
};

const getEnabledMfs = function (containerName) {
    return importMap[containerName].filter(mf => mf.enabled);
};

const callback = function (mutationsList) {
    for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
                let mfContainers = node.querySelectorAll('[mf-container]');
                for (const mfContainer of mfContainers) {
                    let containerName = mfContainer.getAttribute('mf-container');
                    if (importMap[containerName]) {
                        cleanUpContainer(mfContainer);
                        const enabledMfs = getEnabledMfs(containerName);
                        for (const enabledMf of enabledMfs) {
                            createDOM(mfContainer, enabledMf.name);
                            loadApp(mfContainer, enabledMf);
                        }
                    }
                }
            }
        }
    }
};

const observer = new MutationObserver(callback);

observer.observe(document, { childList: true, subtree: true });
