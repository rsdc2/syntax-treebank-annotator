enum ViewType {
    Word = "word",
    Sentence = "sentence",
    Unknown = "unknown"
}

class ViewState {
    _tokenId: Maybe<string>
    _sentenceId: Maybe<string>
    _arethusa: Maybe<ArethusaDoc>

    constructor (
        tokenId: Maybe<string>, 
        sentenceId: Maybe<string>, 
        arethusa: Maybe<ArethusaDoc>
    ) 
    {

        const getTokenId = tokenId.fmap(ArethusaDoc.sentenceIdByTokenId)
        const sentenceIdFromWord = arethusa
            .applyBind(getTokenId)

        this._sentenceId = tokenId.isNothing ? 
            sentenceId : 
            sentenceIdFromWord
            
        this._tokenId = tokenId
        this._arethusa = arethusa.bind(ArethusaDoc.deepcopy)

    }

    get currentWordId () {
        return this._tokenId
    }

    set currentWordId (value: Maybe<string>) {
        this._tokenId = value
    }

    get currentSentenceId () {  
        return this._sentenceId
    }

    set currentSentenceId (value: Maybe<string>) {
        this._sentenceId = value
    }

    static currentSentenceId = (vs: ViewState) => {
        return vs._sentenceId
    }

    static currentTokenId = (state: ViewState) => {
        return state._tokenId
    }

    static deepcopy = (s: ViewState) => {
        return new ViewState (
            s._tokenId, 
            s._sentenceId, 
            s._arethusa.bind(ArethusaDoc.deepcopy)
        )
    }

    static sentencesSame = (s1: ViewState) => (s2: ViewState) => {
        return s1.sentenceId.unpackT("") == s2.sentenceId.unpackT("")
    }

    get isSentence () {
        return this.currentSentenceId.value !== Nothing.of().value 
            && !this.isWord 
    }

    get isWord () {
        return this.currentWordId.value !== Nothing.of().value
    }

    static of = (wordId: string) => (sentenceId: string) => (arethusa: ArethusaDoc) => {
        return new ViewState(MaybeT.of(wordId), MaybeT.of(sentenceId), MaybeT.of(arethusa))
    }

    get sentenceId() {
        return this._sentenceId
    }

    static sentenceId = (vs: ViewState) => {
        return vs.sentenceId
    }

    static setCurrentSentenceId = (value: Maybe<string>) => (s: ViewState) => {
        s._sentenceId = value
    }

    static setCurrentWordId = (value: Maybe<string>) => (s: ViewState) => {
        s._tokenId = value
    }

    get viewType () {
        if (this.isWord) {
            return ViewType.Word
        }
        if (this.isSentence) {
            return ViewType.Sentence
        }
        return ViewType.Unknown
    }

    get maybeViewType () {
        if (this.isWord) {
            return MaybeT.of(ViewType.Word)
        }
        if (this.isSentence) {
            return MaybeT.of(ViewType.Sentence)
        }
        return Nothing.of<ViewType>()
    }

    static viewType = (vs: ViewState) => {
        return vs.viewType
    }

}