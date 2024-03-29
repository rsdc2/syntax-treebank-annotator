var HTML;
(function (HTML) {
    HTML.contains = (parentNode) => (descendantNode) => {
        return parentNode.contains(descendantNode);
    };
    HTML.id = (id) => {
        return MaybeT.of(document.getElementById(id));
    };
    HTML.ownerDocument = (node) => {
        return MaybeT.of(node.ownerDocument);
    };
    HTML.q = (query) => {
        return MaybeT.of(document.querySelector(query));
    };
    HTML.qThrow = (message, query) => {
        return MaybeT.ofThrow(message, document.querySelector(query));
    };
    HTML.setValue = (value) => {
        function _setValue(elem) {
            elem.value = value;
            return MaybeT.of(elem);
        }
        return _setValue;
    };
    HTML.value = (elem) => {
        return elem.value;
    };
    let Div;
    (function (Div) {
        Div.textContent = (elem) => {
            return MaybeT.of(elem.textContent);
        };
        Div.setOnclickFunc = (func) => (btn) => {
            btn.onclick = func;
        };
    })(Div = HTML.Div || (HTML.Div = {}));
    let Elem;
    (function (Elem) {
        Elem.click = (elem) => {
            elem.click();
            return elem;
        };
        Elem.classList = (elem) => {
            return elem.classList;
        };
        Elem.create = (name) => {
            return MaybeT.of(document.createElement(name));
        };
        Elem.getAttr = (qualifiedName) => (elem) => {
            return MaybeT.of(elem.getAttribute(qualifiedName));
        };
        Elem.getHidden = (elem) => {
            return Elem.getAttr("hidden")(elem);
        };
        /**
         * Remove an element from the DOM. Cf. https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
         * @param elem Element
         */
        Elem.remove = (elem) => {
            elem.remove();
        };
        Elem.removeAttr = (qualifiedName) => (elem) => {
            elem.removeAttribute(qualifiedName);
            return elem;
        };
        Elem.setHidden = (elem) => {
            return HTML.Elem.setAttr("hidden")("")(elem);
        };
        Elem.unsetHidden = (elem) => {
            return HTML.Elem.removeAttr("hidden")(elem);
        };
        Elem.setOnChangeFunc = (func) => (elem) => {
            elem.onchange = func;
            return elem;
        };
        Elem.setOnClickFunc = (func) => (elem) => {
            elem.onclick = func;
            return elem;
        };
        Elem.toggleHidden = (elem) => {
            if (MaybeT.of(elem).bind(Elem.getHidden).fromMaybe("false") == "false") {
                HTML.Elem.setHidden(elem);
                return;
            }
            HTML.Elem.removeAttr("hidden")(elem);
        };
        Elem.setAttr = (qualifiedName) => (value) => (elem) => {
            elem.setAttribute(qualifiedName, value);
            return elem;
        };
        Elem.getStyle = (styleName) => (elem) => {
            const value = elem.style[styleName];
            return MaybeT.of(value);
        };
        Elem.setStyle = (styleName) => (styleValue) => (elem) => {
            if (styleName in elem) {
                elem.style[styleName] = styleValue;
            }
            return elem;
        };
        let Class;
        (function (Class) {
            Class.contains = (token) => (elem) => {
                return elem.classList.contains(token);
            };
            Class.remove = (token) => (elem) => {
                elem.classList.remove(token);
                return elem;
            };
            Class.add = (token) => (elem) => {
                elem.classList.add(token);
                return elem;
            };
            Class.toggle = (token) => (elem) => {
                if (elem.classList.contains(token)) {
                    elem.classList.remove(token);
                }
                else {
                    elem.classList.add(token);
                }
            };
        })(Class = Elem.Class || (Elem.Class = {}));
    })(Elem = HTML.Elem || (HTML.Elem = {}));
    let URL;
    (function (URL) {
        URL.createObjectURL = (blob) => {
            return window.URL.createObjectURL(blob);
        };
        URL.revokeObjectURL = (url) => {
            return window.URL.revokeObjectURL(url);
        };
    })(URL = HTML.URL || (HTML.URL = {}));
})(HTML || (HTML = {}));
