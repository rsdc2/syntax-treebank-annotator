class SentencesDiv {
    static get control() {
        return HTML.q("div#sentencesDiv");
    }
    static getText() {
        return SentencesDiv
            .control
            .bind(Div.textContent);
    }
    static setText = (text) => {
        SentencesDiv
            .control
            .fmap(Div.setTextContent(text))
            .fmap(HTML.Elem.setAttr("style")("white-space: pre;"));
    };
}
