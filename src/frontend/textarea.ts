class TextArea {

    static postCursorOffset = (stringLength: number) => (textarea: HTMLTextAreaElement) => {
        return textarea.selectionEnd + stringLength
    }

    static textToPreCursorPos = (textarea: HTMLTextAreaElement) => (preCursorPos: number) => {
        return TextArea.textFromRange (textarea) ([0, preCursorPos])
    }

    static textFromPostCursorPos = (textarea: HTMLTextAreaElement) => (postCursorPos: number) => {
        return TextArea.textFromRange (textarea) ([postCursorPos, TextArea.len(textarea)])
    }

    static textToSelectionStart = (textarea: HTMLTextAreaElement) => {
        const start = textarea.selectionStart
        return TextArea.textToPreCursorPos (textarea) (start)
    }

    static textToSelectionEnd = (textarea: HTMLTextAreaElement) => {
        const end = textarea.selectionEnd
        return TextArea.textFromPostCursorPos (textarea) (end)
    }

    static nodeBoundariesOfPos = (textarea: HTMLTextAreaElement) => (prePos: number) => (postPos: number) => {
        const textToStart = TextArea.textToPreCursorPos (textarea) (prePos)
        const textToEnd = TextArea.textFromPostCursorPos (textarea) (postPos)

        // const leftBoundary = textToStart.search("")//
        const leftBoundary = textToStart.lastIndexOf("<")

        // const rightText = MaybeT.of(textToStart.match(/(\/>)|(\<\/.+?\>)/g)?.values())
        const rightBoundary = textToEnd.indexOf("/>") + TextArea.postCursorOffset (2) (textarea)
        //textToEnd.search(/(\/>)|(\<\/.+?\>)/g) + TextArea.postCursorOffset (rightText) (textarea)

        return [leftBoundary, rightBoundary] as [number, number]
    }

    static currentNodeBoundaries = (textarea: HTMLTextAreaElement) => {
        return TextArea.nodeBoundariesOfPos (textarea) (textarea.selectionStart) (textarea.selectionEnd)
    }

    static currentNodeStr(textarea: HTMLTextAreaElement) {
        return TextArea.textFromRange (textarea) (TextArea.currentNodeBoundaries(textarea))
    }

    static currentNode(textarea: HTMLTextAreaElement) {
        return XML.documentElement (
                XML.fromXMLStr (TextArea.currentNodeStr(textarea))
            )
    }

    static currentSentenceId = (textarea: HTMLTextAreaElement) => {
        const currentNode = TextArea.currentNode(textarea)
        const currentNodeName = currentNode.fmap(XML.nodeName)
        if (currentNodeName.eq("sentence")) {
            return currentNode.bind(XML.attrVal("id"))

        } else if (currentNodeName.eq("word")) {
            const currentNodeBoundaries = TextArea.currentNodeBoundaries(textarea)
            const prevText = TextArea.textToPreCursorPos (textarea) (currentNodeBoundaries[0])
    
            return MaybeT.of(prevText.match(/(?<=\<sentence\s.*?id=\")\d+(?=\".*?\>)/g))
                .bind(Arr.last)

        } else {
            return Nothing.of<string>()
        }
    }

    static currentSentence = (textarea: HTMLTextAreaElement) => {
        const currentNodeName = TextArea.currentNode(textarea).fmap(XML.nodeName)
        if (currentNodeName.eq("sentence")) {
            return TextArea.currentNode(textarea)
                .fmap(ArethusaSentence.fromXMLNode)
        } else if (currentNodeName.eq("word")) {
            const currentNodeBoundaries = TextArea.currentNodeBoundaries(textarea)
            const prevText = TextArea.textToPreCursorPos (textarea) (currentNodeBoundaries[0])
    
            // const tags = prevText.match(/(?<=\<)([A-Za-z_]+)(?=.*?\>)/g)
            // const siblings1 = prevText.match(/(?<=\<)([A-Za-z_]+)(?=.*?[^\/]\>.*?\<\/\1\>)/g)
            // const siblings2 = prevText.match(/(?<=\<)([A-Za-z_]+)(?=.*?\/\>)/g)
    
            const sentenceParentId = TextArea.currentSentenceId(textarea)
            const getSentenceById = sentenceParentId.fmap(Arethusa.sentenceById)
            const lastSentenceParent = globalState
                .textStateIO
                .bind(TextStateIO.outputArethusa)
                .applyBind(getSentenceById) 

            return lastSentenceParent
        } else {
            return Nothing.of<ArethusaSentence>()
        }


        // const leftBoundary = prevText.lastIndexOf("<")
        // const rightBoundary = prevText.indexOf("</")

        // return [leftBoundary, rightBoundary] as [number, number]
    }

    static currentWordId = (textarea: HTMLTextAreaElement) => {
        const currentNode = TextArea.currentNode(textarea)
        const currentNodeName = currentNode.fmap(XML.nodeName)

        if (currentNodeName.eq("word")) {
            return currentNode.bind(XML.attrVal("id"))

        } else {
            return Nothing.of<string>()
        }
    }

    static len(textarea: HTMLTextAreaElement) {
        return textarea.value.length
    }

    static setKeydownEvent = (func) => (textarea: HTMLTextAreaElement) => {
        textarea.onkeydown = func;
    }

    static textFromRange(textarea: HTMLTextAreaElement) {
        function _textFromRange([start, end]: [number, number]) {
            return textarea.value.substring(start, end) 
        }
        return _textFromRange
    }

    static textFromSelection(textarea: HTMLTextAreaElement) {
        // cf. https://stackoverflow.com/questions/717224/how-can-i-get-the-selected-text-in-a-textarea
        return textarea.value.substring(
            textarea.selectionStart,
            textarea.selectionEnd
        )
    }

    static value(textarea: HTMLTextAreaElement) {
        return textarea.value
    }

    static setValue = (value: string) => 
        (textarea: HTMLTextAreaElement) => {
        
        textarea.value = value;
        return textarea
    }
}