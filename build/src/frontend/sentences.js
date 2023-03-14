class SentencesDiv {
    static get control() {
        return HTML.q("div#sentencesDiv");
    }
}
SentencesDiv.setText = (text) => {
    SentencesDiv
        .control
        .fmap(Div.setTextContent(text));
};
