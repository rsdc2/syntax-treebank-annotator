class DivTextNodeInfo {
    totalLength;
    maybeText;
    startIdx;
    endIdx;
    constructor(totalLength, maybeText, startIdx, endIdx) {
        this.totalLength = totalLength;
        this.maybeText = maybeText;
        this.startIdx = startIdx;
        this.endIdx = endIdx;
    }
    static of = (totalLength) => (startIdx) => (endIdx) => (maybeText) => {
        return new DivTextNodeInfo(totalLength, maybeText, startIdx, endIdx);
    };
}
class Div {
    static selectionStartPosByDivId = (id) => {
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
    static textNodesPriorToSelAnchorNodeByDivId = (id) => (sel) => {
        return MaybeT.of(sel)
            .bind(Sel.anchorNode)
            .fmap(XML.previousTextNodesWithAncestorByAncestorId("div")("id")(id))
            .fromMaybe([]);
    };
    static selectionEndPosByDivId = (id) => {
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
    /**
     * Return innerHTML of Div element
     * @param div
     * @returns
     */
    static innerHTML = (div) => {
        return div.innerHTML;
    };
    static innerText = (div) => {
        return div.innerText;
    };
    static setTextContent = (s) => (div) => {
        div.textContent = s;
        return div;
    };
    static textContent = (div) => {
        return MaybeT.of(div.textContent);
    };
    static textFromRange = (div) => (start) => (end) => {
        const _start = start < end ? start : end;
        const _end = start < end ? end : start;
        const getSubstring = Str.substring(_start)(_end);
        return MaybeT.of(div)
            .bind(Div.textContent)
            .fmap(getSubstring);
    };
    static textFromRangeMaybes = (div) => (start) => (end) => {
        const x = div
            .fmap(Div.textFromRange);
        const y = start
            .applyFmap(x);
        return end
            .applyBind(y);
    };
}
