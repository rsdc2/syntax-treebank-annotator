class TextArea {
    static postCursorOffset = (stringLength) => (textarea) => {
        return textarea.selectionEnd + stringLength;
    };
    static textToPreCursorPos = (textarea) => (preCursorPos) => {
        return TextArea.textFromRange(textarea)([0, preCursorPos]);
    };
    static textFromPostCursorPos = (textarea) => (postCursorPos) => {
        return TextArea.textFromRange(textarea)([postCursorPos, TextArea.len(textarea)]);
    };
    static textToSelectionStart = (textarea) => {
        const start = textarea.selectionStart;
        return TextArea.textToPreCursorPos(textarea)(start);
    };
    static textToSelectionEnd = (textarea) => {
        const end = textarea.selectionEnd;
        return TextArea.textFromPostCursorPos(textarea)(end);
    };
    static nodeBoundariesOfPos = (textarea) => (prePos) => (postPos) => {
        const textToStart = TextArea.textToPreCursorPos(textarea)(prePos);
        const textToEnd = TextArea.textFromPostCursorPos(textarea)(postPos);
        // const leftBoundary = textToStart.search("")//
        const leftBoundary = textToStart.lastIndexOf("<");
        // const rightText = MaybeT.of(textToStart.match(/(\/>)|(\<\/.+?\>)/g)?.values())
        const rightBoundary = textToEnd.indexOf("/>") + TextArea.postCursorOffset(2)(textarea);
        //textToEnd.search(/(\/>)|(\<\/.+?\>)/g) + TextArea.postCursorOffset (rightText) (textarea)
        return [leftBoundary, rightBoundary];
    };
    static currentNodeBoundaries = (textarea) => {
        return TextArea.nodeBoundariesOfPos(textarea)(textarea.selectionStart)(textarea.selectionEnd);
    };
    static currentNodeStr(textarea) {
        return TextArea.textFromRange(textarea)(TextArea.currentNodeBoundaries(textarea));
    }
    static currentNode(textarea) {
        return XML.documentElement(XML.fromXMLStr(TextArea.currentNodeStr(textarea)));
    }
    static currentSentenceId = (textarea) => {
        const currentNode = TextArea.currentNode(textarea);
        const currentNodeName = currentNode.fmap(XML.nodeName);
        if (currentNodeName.eq("sentence")) {
            return currentNode.bind(XML.attrVal("id"));
        }
        else if (currentNodeName.eq("word")) {
            const currentNodeBoundaries = TextArea.currentNodeBoundaries(textarea);
            const prevText = TextArea.textToPreCursorPos(textarea)(currentNodeBoundaries[0]);
            return MaybeT.of(prevText.match(/(?<=\<sentence\s.*?id=\")\d+(?=\".*?\>)/g))
                .bind(Arr.last);
        }
        else {
            return Nothing.of();
        }
    };
    static currentSentence = (textarea) => {
        const currentNodeName = TextArea.currentNode(textarea).fmap(XML.nodeName);
        if (currentNodeName.eq("sentence")) {
            return TextArea.currentNode(textarea)
                .fmap(ArethusaSentence.fromXMLNode);
        }
        else if (currentNodeName.eq("word")) {
            const currentNodeBoundaries = TextArea.currentNodeBoundaries(textarea);
            const prevText = TextArea.textToPreCursorPos(textarea)(currentNodeBoundaries[0]);
            const sentenceParentId = TextArea.currentSentenceId(textarea);
            const getSentenceById = sentenceParentId.fmap(ArethusaDoc.sentenceById);
            const lastSentenceParent = globalState
                .textStateIO
                .bind(TextStateIO.outputArethusa)
                .applyBind(getSentenceById);
            return lastSentenceParent;
        }
        else {
            return Nothing.of();
        }
    };
    static currentWordId = (textarea) => {
        const currentNode = TextArea.currentNode(textarea);
        const currentNodeName = currentNode.fmap(XML.nodeName);
        if (currentNodeName.eq("word")) {
            return currentNode.bind(XML.attrVal("id"));
        }
        else {
            return Nothing.of();
        }
    };
    static len(textarea) {
        return textarea.value.length;
    }
    static setKeydownEvent = (func) => (textarea) => {
        textarea.onkeydown = func;
    };
    static textFromRange(textarea) {
        function _textFromRange([start, end]) {
            return textarea.value.substring(start, end);
        }
        return _textFromRange;
    }
    static textFromSelection(textarea) {
        // cf. https://stackoverflow.com/questions/717224/how-can-i-get-the-selected-text-in-a-textarea
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring
        return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    }
    static value(textarea) {
        return textarea.value;
    }
    static setValue = (value) => (textarea) => {
        textarea.value = value;
        return textarea;
    };
}
