class AthDivCurs {

    static addPreTextOffset() {
        return AthDivCurs
            .preTextLength
            .fmap(Num.add)
    }

    static get atomicTags() {
        return ArethusaDiv
            .textContent
            .fmap(Str.matches(XMLTagRegExps.atomic))
    }

    static get currentHTMLAnchorNode() {
        return
    }

    static get currentXMLNode() {
        switch (AthDivCurs.currentXMLTagPosition) {

            default: {
                return AthDivCurs
                    .currentXMLNodeText
                    .fmap(XML.fromXMLStr)
                    .bind(XML.documentElement)
            }
        }
    }

    static get currentXMLNodeName() {
        return AthDivCurs
            .currentXMLNode
            .fmap(XML.nodeName)
    }

    // This is what determines what is highlighted when editable div is clicked
    static get currentXMLNodeText() {
        switch (AthDivCurs.currentXMLTagPosition) {
            case (XMLCursorTagPosition.insideAtomicTag): {
                return AthDivCurs.currentXMLTagAsStr
            }

            case (XMLCursorTagPosition.insideOpeningTag): {
                const closingTagRegExp = AthDivCurs
                    .currentXMLTagName
                    .fmap(
                        XML.buildRegExp(XMLGenericTagRegExps.closingWithName)
                    )

                // !! NB This won't necessarily work with recursive tags !!
                const closingTagLastIdx = AthDivCurs
                    .postText
                    .applyFmap(closingTagRegExp.fmap(Str.matches))
                    .bind(Arr.head)
                    .fmap(RegexMatchT.lastIndex)
                    .applyFmap(AthDivCurs.addPreTextOffset())

                const AthDivCursTagStartIdx = AthDivCurs
                    .currentXMLTagRange[0]

                return Div.textFromRangeMaybes
                    (ArethusaDiv.control)
                    (AthDivCursTagStartIdx)
                    (closingTagLastIdx)

            }

            case (XMLCursorTagPosition.insideClosingTag): {
                const openingTagRegExp = AthDivCurs
                    .currentXMLTagName
                    .fmap(
                        XML.buildRegExp(XMLGenericTagRegExps.openingWithName)
                    )

                // !! NB This won't necessarily work with recursive tags !!
                const openingTagFirstIdx = AthDivCurs
                    .preText
                    .applyFmap(openingTagRegExp.fmap(Str.matches))
                    .bind(Arr.last)
                    .fmap(RegexMatchT.firstIndex)

                const AthDivCursTagLastIdx = AthDivCurs
                    .currentXMLTagRange[1]

                return Div.textFromRangeMaybes
                    (ArethusaDiv.control)
                    (AthDivCursTagLastIdx)
                    (openingTagFirstIdx)
            }

            default: return MaybeT.of("")
        }

    }

    static get currentSentenceId() {
        if (AthDivCurs.currentXMLNodeName.eq("sentence")) {
            return AthDivCurs
                .currentXMLNode
                .bind(XML.attrVal("id"))

        } else if (AthDivCurs.currentXMLNodeName.eq("word")) {
            const getSentenceByWordId = AthDivCurs
                .currentWordId
                .fmap(ArethusaDoc.sentenceByWordId)

            return globalState
                .textStateIO
                .bind(TextStateIO.outputArethusa)
                .applyBind(getSentenceByWordId)
                .bind(ArethusaSentence.id)

        } else {
            return Nothing.of<string>()
        }
    }

    static get currentXMLTagPosition() {
        return AthDivCurs
            .currentXMLTagType
            .unpackT(XMLCursorTagPosition.unknown)
    }

    static get currentWordId() {
        if (AthDivCurs.currentXMLNodeName.eq("word")) {
            return AthDivCurs
                .currentXMLNode
                .bind(XML.attrVal("id"))
        } else {
            return Nothing.of<string>()
        }
    }

    static checkCursorXMLTagPosition = (leftTagFragName: string) => (rightTagFragName: string) => {
        // Gets current cursor position from AthDivCurs.preText / postText

        const leftTagFragPos = AthDivCurs
            .nearestXMLTagFragBoundary
            (End.Start)
            (Dir.Left)
            (XMLTagFragRegExps[leftTagFragName])

        const rightTagFragPos = AthDivCurs
            .nearestXMLTagFragBoundary
            (End.Start)
            (Dir.Right)
            (XMLTagFragRegExps[rightTagFragName])

        const otherLeftTagFrags = XML.otherTagFragments(leftTagFragName)
        const otherRightTagFrags = XML.otherTagFragments(rightTagFragName)
        const otherLeftTagFragPos = AthDivCurs.XMLTagFragBoundaries(End.Start)(Dir.Left)(otherLeftTagFrags)
        const otherRightTagFragPos = AthDivCurs.XMLTagFragBoundaries(End.Start)(Dir.Right)(otherRightTagFrags)

        return MaybeT.isNearest(Dir.Left)(leftTagFragPos)(otherLeftTagFragPos)
            && MaybeT.isNearest(Dir.Right)(rightTagFragPos)(otherRightTagFragPos)
    }

    // static get betweenNonAtomicTags(): boolean {
    //     return AthDivCurs.checkCursorTagPosition 
    //         (XMLTagFragAlias[">"]) 
    //         (XMLTagFragAlias["</"])
    // }

    // static get betweenSiblings() {
    //     return AthDivCurs.checkCursorTagPosition 
    //         (XMLTagFragAlias[">"]) 
    //         (XMLTagFragAlias["<"])
    // }

    // static get betweenParentAndChild() {
    //     return AthDivCurs.checkCursorTagPosition 
    //         (XMLTagFragAlias[">"]) 
    //         (XMLTagFragAlias["<"])
    // }

    static get currentXMLTagRange() {
        const tagType = AthDivCurs.currentXMLTagType.unpackT(XMLCursorTagPosition.unknown)
        switch (tagType) {
            case (XMLCursorTagPosition.insideAtomicTag): {
                const [leftAlias, rightAlias] = cursorTagPositionToAlias.insideAtomicTag
                return AthDivCurs.currentXMLTagRangeByAlias(leftAlias)(rightAlias)
            }
            case (XMLCursorTagPosition.insideClosingTag): {
                const [leftAlias, rightAlias] = cursorTagPositionToAlias.insideClosingTag
                return AthDivCurs.currentXMLTagRangeByAlias(leftAlias)(rightAlias)
            }
            case (XMLCursorTagPosition.insideOpeningTag): {
                const [leftAlias, rightAlias] = cursorTagPositionToAlias.insideOpeningTag
                return AthDivCurs.currentXMLTagRangeByAlias(leftAlias)(rightAlias)
            }
        }

        return [Nothing.of<number>(), Nothing.of<number>()] as [Maybe<number>, Maybe<number>]
    }

    static currentXMLTagRangeByAlias = (leftTagFragAlias: string) => (rightTagFragAlias: string) => {
        const leftBound = AthDivCurs.nearestXMLTagFragBoundary
            (End.Start)
            (Dir.Left)
            (XMLTagFragRegExps[XMLTagFragAlias[leftTagFragAlias]])

        const rightBound = AthDivCurs.nearestXMLTagFragBoundary
            (End.End)
            (Dir.Right)
            (XMLTagFragRegExps[XMLTagFragAlias[rightTagFragAlias]])
            .applyFmap(AthDivCurs.preTextLength.fmap(Num.add))

        return [leftBound, rightBound] as [Maybe<number>, Maybe<number>]
    }

    static currentXMLTagTextByAlias = (leftTagFragAlias: string) => (rightTagFragAlias: string) => {
        const [leftBound, rightBound] = AthDivCurs.currentXMLTagRangeByAlias(leftTagFragAlias)(rightTagFragAlias)
        return Div.textFromRangeMaybes(ArethusaDiv.control)(leftBound)(rightBound)
    }

    static get currentXMLTagAsStr(): Maybe<string> {
        const cursorTagPosition = AthDivCurs
            .currentXMLTagType
            .unpackT(XMLCursorTagPosition.unknown)

        switch (cursorTagPosition) {
            case XMLCursorTagPosition.insideAtomicTag:
                return AthDivCurs.currentXMLTagTextByAlias("<")("/>")

            case XMLCursorTagPosition.insideOpeningTag:
                return AthDivCurs.currentXMLTagTextByAlias("<")(">")

            case XMLCursorTagPosition.insideClosingTag:
                return AthDivCurs.currentXMLTagTextByAlias("</")(">")

            case XMLCursorTagPosition.betweenTags:
                return Nothing.of<string>()
        }
        return Nothing.of<string>()
    }

    static get cursorIdx() {
        return AthDivCurs.selectionEndIdx
    }

    static get currentXMLTagName() {
        return AthDivCurs
            .currentXMLTagAsStr
            .bind(XML.tagNameFromTagStr)
    }

    static get currentXMLTagType() {
        const f = MaybeT.of
        if (AthDivCurs.cursorInsideAtomicXMLTag) {
            return f(XMLCursorTagPosition.insideAtomicTag)
        }
        if (AthDivCurs.cursorBetweenXMLTags) {
            return f(XMLCursorTagPosition.betweenTags)
        }
        if (AthDivCurs.cursorInsideClosingXMLTag) {
            return f(XMLCursorTagPosition.insideClosingTag)
        }
        if (AthDivCurs.cursorInsideOpeningXMLTag) {
            return f(XMLCursorTagPosition.insideOpeningTag)
        }
        return f<XMLCursorTagPosition>(null)
    }

    static get cursorInsideOpeningXMLTag(): boolean {
        return AthDivCurs.checkCursorXMLTagPosition
            (XMLTagFragAlias["<"])
            (XMLTagFragAlias[">"])
    }

    static get cursorInsideClosingXMLTag(): boolean {
        return AthDivCurs.checkCursorXMLTagPosition
            (XMLTagFragAlias["</"])
            (XMLTagFragAlias[">"])
    }

    static get cursorInsideAtomicXMLTag(): boolean {
        return AthDivCurs.checkCursorXMLTagPosition
            (XMLTagFragAlias["<"])
            (XMLTagFragAlias["/>"])
    }

    static get cursorBetweenXMLTags(): boolean {
        return AthDivCurs.checkCursorXMLTagPosition
            (XMLTagFragAlias[">"])
            (XMLTagFragAlias["<"])
            || AthDivCurs.checkCursorXMLTagPosition
                (XMLTagFragAlias["/>"])
                (XMLTagFragAlias["<"])
            || AthDivCurs.checkCursorXMLTagPosition
                (XMLTagFragAlias[">"])
                (XMLTagFragAlias["</"])
    }

    static nearestXMLTagFragBoundary = (matchEnd: End) => (dir: Dir) => (regexp: RegExp) => {
        const matchFunc =
            dir === Dir.Left ?
                Str.lastMatch(regexp) :
                Str.firstMatch(regexp)

        const text = dir === Dir.Left ?
            AthDivCurs.preText :
            AthDivCurs.postText

        const getIndexFunc = matchEnd === End.Start ?
            RegexMatchT.firstIndex :
            RegexMatchT.lastIndex

        return text
            .bind(matchFunc)
            .fmap(getIndexFunc)
    }

    static get postText() {
        const textFromRange = flip_1_to_3(Div.textFromRange)

        return ArethusaDiv
            .control
            .bind(textFromRange(AthDivCurs.selectionEndIdx)(AthDivCurs.textLength))
    }

    static get preText() {
        const textFromRange = flip_1_to_3(Div.textFromRange)

        return ArethusaDiv
            .control
            .bind(textFromRange(0)(AthDivCurs.selectionEndIdx))
    }

    static get preTextLength() {
        return AthDivCurs
            .preText
            .fmap(Str.len)
    }

    static get selectionEndIdx() {
        return Div.selectionEndPosByDivId("arethusaDiv")
    }

    static get selectionStartIdx() {
        return Div.selectionStartPosByDivId("arethusaDiv")
    }

    static get selectedText() {
        const textFromRange = flip_1_to_3(Div.textFromRange)
        const getTextFromRange = textFromRange
            (AthDivCurs.selectionStartIdx)
            (AthDivCurs.selectionEndIdx)
        return Frontend
            .arethusaOutputDiv
            .bind(getTextFromRange)
    }

    static setCursorPosFromAthDivOffset = (divOffset: number) => {
        // console.log("Set cursor position.")
        const anchorInfo = AthDivCurs.textNodeOfIdx(divOffset)
        const createCursorPos = CursorPos.of(divOffset - anchorInfo.startIdx)
        const cursorPos = anchorInfo.maybeText.fmap(createCursorPos)

        MaybeT.of(window.getSelection())
            .applyFmap(cursorPos.fmap(Sel.setCursorPos))
    }

    static get textLength() {
        return ArethusaDiv
            .textContent
            .fmap(Str.len)
            .unpack(0)
    }

    static textNodeOfIdx = (idx: number) => {

        const textNodes = ArethusaDiv
            .control
            .bind(XML.descendantTextNodes)
            .unpackT([])

        return textNodes.reduce(
            (nodeInfo: IDivTextNodeInfo, textNode: Text) => {
                const newTotalLength = nodeInfo.totalLength + textNode.length
                if (idx > nodeInfo.totalLength && idx < newTotalLength) {
                    return {
                        totalLength: newTotalLength,
                        maybeText: MaybeT.of(textNode),
                        startIdx: nodeInfo.totalLength,
                        endIdx: newTotalLength
                    }
                }
                return { totalLength: newTotalLength, maybeText: nodeInfo.maybeText, startIdx: nodeInfo.startIdx, endIdx: nodeInfo.endIdx }
            }
            , { totalLength: 0, maybeText: Nothing.of<Text>(), startIdx: 0, endIdx: 0 })


    }

    static textToPreCursorPos = (div: HTMLDivElement) => (preCursorPos: number) => {
        return Div.textFromRange(div)(0)(preCursorPos)
    }

    static textFromPostCursorPos = (div: HTMLDivElement) => (postCursorPos: number) => {
        const divTextLength = Div
            .textContent(div)
            .fmap(Str.len)

        return divTextLength.bind(Div.textFromRange(div)(postCursorPos))
    }



    static XMLTagFragBoundaries = (end: End) => (dir: Dir) => (tagFragNames: string[]) => {
        return tagFragNames.map(
            (tagFragName: string) => {
                const regexp = XMLTagFragRegExps[tagFragName]
                return AthDivCurs.nearestXMLTagFragBoundary(end)(dir)(regexp)
            }
        )
    }
}