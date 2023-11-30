class SentencesDiv {

    static get control () {
        return HTML.q("div#sentencesDiv") as Maybe<HTMLDivElement>
    }

    static getText(): Maybe<string> {
        return SentencesDiv
            .control
            .bind(Div.textContent)
    }

    static setText = (text: string) => {
        SentencesDiv
            .control
            .fmap(Div.setTextContent(text))
            .fmap(HTML.Elem.setAttr("style")("white-space: pre;"))
    }


}