class ArethusaDiv {
    static get control() {
        return HTML.id("arethusaDiv");
    }
    static get innerHTML() {
        return Frontend
            .arethusaOutputDiv
            .fmap(Div.innerHTML);
    }
    static get innerText() {
        return Frontend
            .arethusaOutputDiv
            .fmap(Div.innerText);
    }
    static get textContent() {
        return ArethusaDiv
            .control
            .bind(Div.textContent);
    }
}
ArethusaDiv.click = () => {
    const divOffset = AthDivCurs
        .selectionEndIdx;
    globalState
        .textStateIO
        .fmap(TextStateIO.changeView(AthDivCurs.currentTokenId)(AthDivCurs.currentSentenceId));
    // Set the cursor position
    AthDivCurs
        .setCursorPosFromAthDivOffset(divOffset);
};
ArethusaDiv.nextSentence = () => {
    TextStateIO;
    globalState
        .textStateIO
        .fmap(TextStateIO.changeView(Nothing.of())(MaybeT.of(AthDivCurs.nextSentenceId)));
};
ArethusaDiv.prevSentence = () => {
    TextStateIO;
    globalState
        .textStateIO
        .fmap(TextStateIO.changeView(Nothing.of())(MaybeT.of(AthDivCurs.prevSentenceId)));
};
ArethusaDiv.formatXMLForDiv = (xml) => {
    return xml
        .replace(/\</g, "&lt")
        .replace(/\>/g, "&gt");
};
ArethusaDiv.tagsByNameAndType = (genericTagRegExp) => (tagName) => {
    const regexp = XML.buildRegExp(genericTagRegExp)(tagName);
    return ArethusaDiv.textContent
        .fmap(Str.matches(regexp))
        .fromMaybe([]);
};
