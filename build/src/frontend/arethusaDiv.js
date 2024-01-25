class ArethusaDiv {
    static click = () => {
        const divOffset = AthDivCurs
            .selectionEndIdx;
        globalState
            .textStateIO
            .fmap(TextStateIO.changeView(AthDivCurs.currentTokenId)(AthDivCurs.currentSentenceId));
        // Set the cursor position
        AthDivCurs
            .setCursorPosFromAthDivOffset(divOffset);
    };
    static nextSentence = () => {
        TextStateIO;
        globalState
            .textStateIO
            .fmap(TextStateIO.changeView(Nothing.of())(MaybeT.of(AthDivCurs.nextSentenceId)));
    };
    static prevSentence = () => {
        TextStateIO;
        globalState
            .textStateIO
            .fmap(TextStateIO.changeView(Nothing.of())(MaybeT.of(AthDivCurs.prevSentenceId)));
    };
    static get control() {
        return HTML.id("arethusaDiv");
    }
    static get innerText() {
        return Frontend
            .arethusaOutputDiv
            .fmap(Div.innerText);
    }
    static tagsByNameAndType = (genericTagRegExp) => (tagName) => {
        const regexp = XML.buildRegExp(genericTagRegExp)(tagName);
        return ArethusaDiv.textContent
            .fmap(Str.matches(regexp))
            .fromMaybe([]);
    };
    static get textContent() {
        return ArethusaDiv
            .control
            .bind(Div.textContent);
    }
}
