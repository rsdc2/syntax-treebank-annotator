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
    HTML.setInnerHTML = (html) => (elem) => {
        elem.innerHTML = html;
        return MaybeT.of(elem);
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
        Elem.classList = (elem) => {
            return elem.classList;
        };
        Elem.getAttr = (qualifiedName) => (elem) => {
            return MaybeT.of(elem.getAttribute(qualifiedName));
        };
        Elem.getHidden = (elem) => {
            return Elem.getAttr("hidden")(elem);
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
        Elem.setOnclickFunc = (func) => (elem) => {
            elem.onclick = func;
        };
        Elem.toggleHidden = (elem) => {
            if (MaybeT.of(elem).bind(Elem.getHidden).unpackT("false") == "false") {
                HTML.Elem.setHidden(elem);
                return;
            }
            HTML.Elem.removeAttr("hidden")(elem);
        };
        Elem.setAttr = (qualifiedName) => (value) => (elem) => {
            elem.setAttribute(qualifiedName, value);
            return elem;
        };
        Elem.appendStyle = (styleName) => (styleValue) => (elem) => {
            // NB untested
            const setAttrFunc = flip_2_to_3(HTML.Elem.setAttr);
            return HTML.Elem
                .getAttr("style")(elem)
                .fmap(Str.join(";")(styleValue))
                .fmap(setAttrFunc(styleName)(elem));
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
})(HTML || (HTML = {}));
