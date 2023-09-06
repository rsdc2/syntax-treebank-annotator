interface IDivTextNodeInfo {
    totalLength: number,
    maybeText: Maybe<Text>,
    startIdx: number,
    endIdx: number
}

class DivTextNodeInfo implements IDivTextNodeInfo{
    totalLength: number
    maybeText: Maybe<Text>
    startIdx: number
    endIdx: number

    constructor (
        totalLength: number,
        maybeText: Maybe<Text>,
        startIdx: number,
        endIdx: number
        ) {
        
        this.totalLength = totalLength
        this.maybeText = maybeText
        this.startIdx = startIdx
        this.endIdx = endIdx
    }

    static of = (totalLength: number) => (startIdx: number) => (endIdx: number) => (maybeText: Maybe<Text>) => {
        return new DivTextNodeInfo(totalLength, maybeText, startIdx, endIdx)
    }
}

class Div {

    // static cursorPositionByDivId = (id: string) => {
    //     // const selection = MaybeT.of(window.getSelection())
    //     // const prevTextNodes = selection 
    //     //     .fmap( Div.textNodesPriorToSelAnchorNodeByDivId (id) )
    //     //     .unpackT([])
    //     const anchorOffset = selection
    //         .fmap(Sel.anchorOffset)
    // }

    // static currentHTMLCursorPosByDivId = (id: string) => {
    //     const sel = MaybeT.of(window.getSelection())

    //     const focusNode = sel
    //         .bind(Sel.extentNode)

    //     const focusOffset = sel
    //         .fmap(Sel.extentOffset)

    //     const div = HTML.id(id)
        
    //     const focusInDiv = focusNode
    //         .applyFmap(
    //             div.fmap(HTML.contains)
    //         ).unpackT(false)

    //     if (focusInDiv) {
    //         return CursorPos.ofMaybes (focusNode) (focusOffset)
    //     }

    //     return Nothing.of<CursorPos>()
        

    //     // if (focusInDiv) {
    //     //     const setCursorFunc = selRange.fmap(Sel.setCursorPos)
    //     //     sel.applyFmap(setCursorFunc)
    //     // }
       
    // }

    static selectionStartPosByDivId = (id: string) => {
        const selection = MaybeT.of(window.getSelection())

        const previousTextNodes = selection
            .fmap(Div.textNodesPriorToSelAnchorNodeByDivId (id))
            .fromMaybe([])

        const anchorNodeOffset = selection
            .fmap(Sel.anchorOffset)
            .fromMaybe(0)

        const previousTextLength = previousTextNodes
            .reduce (
                (acc: number, item: Text) => acc + item.length, 0
            ) 

        return previousTextLength + anchorNodeOffset
    }

    static textNodesPriorToSelAnchorNodeByDivId = (id: string) => (sel: Selection) => {
        return MaybeT.of(sel)
            .bind( Sel.anchorNode )
            .fmap( XML.previousTextNodesWithAncestorByAncestorId ("div") ("id") (id) )
            .fromMaybe([]) 
    }

    static selectionEndPosByDivId = (id: string) => {
        const selection = MaybeT.of(window.getSelection())

        const previousTextNodes = selection
            .bind(Sel.extentNode)
            .fmap(XML.previousTextNodesWithAncestorByAncestorId ("div") ("id") (id) )
            .fromMaybe([]) 

        const extentNodeOffset = selection
            .fmap(Sel.extentOffset)
            .fromMaybe(0)

        const previousTextLength = previousTextNodes
            .reduce (
                (acc: number, item: Text) => acc + item.length, 0
            ) 

        return previousTextLength + extentNodeOffset
    }

    static innerHTML = (div: HTMLDivElement) => {
        return div.innerHTML
    } 

    static innerText = (div: HTMLDivElement) => {
        return div.innerText
    }

    static setInnerHTML = (s: string) => (div: HTMLDivElement) => {
        div.innerHTML = s
    }
    
    static setTextContent = (s: string) => (div: HTMLDivElement) => {
        div.textContent = s
    }

    static textContent = (div: HTMLDivElement) => {
        return MaybeT.of(div.textContent)
    }

    static textFromRange = (div: HTMLDivElement)  => (start: number) => (end: number)  => {
        const _start = start < end ? start : end
        const _end = start < end ? end : start

        const getSubstring = Str.substring (_start) (_end)

        return MaybeT.of(div)
            .bind(Div.textContent)
            .fmap(getSubstring)
    }

    static textFromRangeMaybes = (div: Maybe<HTMLDivElement>)  => (start: Maybe<number>) => (end: Maybe<number>)  => {
        const x = div
            .fmap(Div.textFromRange)

        const y = start
            .applyFmap(x)

        return end
            .applyBind(y) 
    }

}