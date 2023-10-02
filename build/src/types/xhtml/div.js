class DivTextNodeInfo {
    constructor(totalLength, maybeText, startIdx, endIdx) {
        this.totalLength = totalLength;
        this.maybeText = maybeText;
        this.startIdx = startIdx;
        this.endIdx = endIdx;
    }
}
DivTextNodeInfo.of = (totalLength) => (startIdx) => (endIdx) => (maybeText) => {
    return new DivTextNodeInfo(totalLength, maybeText, startIdx, endIdx);
};
class Div {
}
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
Div.selectionStartPosByDivId = (id) => {
    const selection = MaybeT.of(window.getSelection());
    const previousTextNodes = selection
        .fmap(Div.textNodesPriorToSelAnchorNodeByDivId(id))
        .fromMaybe([]);
    const anchorNodeOffset = selection
        .fmap(Sel.anchorOffset)
        .fromMaybe(0);
    const previousTextLength = previousTextNodes
        .reduce((acc, item) => acc + item.length, 0);
    return previousTextLength + anchorNodeOffset;
};
Div.textNodesPriorToSelAnchorNodeByDivId = (id) => (sel) => {
    return MaybeT.of(sel)
        .bind(Sel.anchorNode)
        .fmap(XML.previousTextNodesWithAncestorByAncestorId("div")("id")(id))
        .fromMaybe([]);
};
Div.selectionEndPosByDivId = (id) => {
    const selection = MaybeT.of(window.getSelection());
    const previousTextNodes = selection
        .bind(Sel.extentNode)
        .fmap(XML.previousTextNodesWithAncestorByAncestorId("div")("id")(id))
        .fromMaybe([]);
    const extentNodeOffset = selection
        .fmap(Sel.extentOffset)
        .fromMaybe(0);
    const previousTextLength = previousTextNodes
        .reduce((acc, item) => acc + item.length, 0);
    return previousTextLength + extentNodeOffset;
};
Div.innerHTML = (div) => {
    return div.innerHTML;
};
Div.innerText = (div) => {
    return div.innerText;
};
Div.setInnerHTML = (s) => (div) => {
    div.innerHTML = s;
};
Div.setTextContent = (s) => (div) => {
    div.textContent = s;
};
Div.textContent = (div) => {
    return MaybeT.of(div.textContent);
};
Div.textFromRange = (div) => (start) => (end) => {
    const _start = start < end ? start : end;
    const _end = start < end ? end : start;
    const getSubstring = Str.substring(_start)(_end);
    return MaybeT.of(div)
        .bind(Div.textContent)
        .fmap(getSubstring);
};
Div.textFromRangeMaybes = (div) => (start) => (end) => {
    const x = div
        .fmap(Div.textFromRange);
    const y = start
        .applyFmap(x);
    return end
        .applyBind(y);
};
