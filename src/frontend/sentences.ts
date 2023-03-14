class SentencesDiv {

    static get control () {
        return HTML.q("div#sentencesDiv") as Maybe<HTMLDivElement>
    }

    static setText = (text: string) => {
        SentencesDiv
            .control
            .fmap(Div.setTextContent(text))
    }

}