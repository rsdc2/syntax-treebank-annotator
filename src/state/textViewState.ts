enum ViewType {
    Word = "word",
    Sentence = "sentence",
    Unknown = "unknown"
}

class ViewState {
    _wordId: Maybe<string>
    _sentenceId: Maybe<string>
    _arethusa: Maybe<ArethusaDoc>

    constructor (
        wordId: Maybe<string>, 
        sentenceId: Maybe<string>, 
        arethusa: Maybe<ArethusaDoc>
        ) 
        {

        const getWordId = wordId.fmap(ArethusaDoc.sentenceIdByTokenId)
        const sentenceIdFromWord = arethusa
            .applyBind(getWordId)

        this._sentenceId = wordId.isNothing ? 
            sentenceId : 
            sentenceIdFromWord
            
        this._wordId = wordId
        this._arethusa = arethusa.bind(ArethusaDoc.deepcopy)

    }

    get currentWordId () {
        return this._wordId
    }

    set currentWordId (value: Maybe<string>) {
        this._wordId = value
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

    static currentWordId = (state: ViewState) => {
        return state._wordId
    }

    static deepcopy = (s: ViewState) => {
        return new ViewState (s._wordId, s._sentenceId, s._arethusa.bind(ArethusaDoc.deepcopy))
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

    static setCurrentSentenceId = (value: Maybe<string>) => (s: ViewState) => {
        s._sentenceId = value
    }

    static setCurrentWordId = (value: Maybe<string>) => (s: ViewState) => {
        s._wordId = value
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