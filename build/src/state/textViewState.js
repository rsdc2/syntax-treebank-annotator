var ViewType;
(function (ViewType) {
    ViewType["Word"] = "word";
    ViewType["Sentence"] = "sentence";
    ViewType["Unknown"] = "unknown";
})(ViewType || (ViewType = {}));
class ViewState {
    _tokenId;
    _sentenceId;
    _arethusa;
    constructor(tokenId, sentenceId, arethusa) {
        const getTokenId = tokenId.fmap(ArethusaDoc.sentenceIdByTokenId);
        const sentenceIdFromWord = arethusa
            .applyBind(getTokenId);
        this._sentenceId = tokenId.isNothing ?
            sentenceId :
            sentenceIdFromWord;
        this._tokenId = tokenId;
        this._arethusa = arethusa.bind(ArethusaDoc.deepcopy);
    }
    get currentWordId() {
        return this._tokenId;
    }
    set currentWordId(value) {
        this._tokenId = value;
    }
    get currentSentenceId() {
        return this._sentenceId;
    }
    set currentSentenceId(value) {
        this._sentenceId = value;
    }
    static currentSentenceId = (vs) => {
        return vs._sentenceId;
    };
    static currentTokenId = (state) => {
        return state._tokenId;
    };
    static deepcopy = (s) => {
        return new ViewState(s._tokenId, s._sentenceId, s._arethusa.bind(ArethusaDoc.deepcopy));
    };
    static sentencesSame = (s1) => (s2) => {
        return s1.sentenceId.fromMaybe("") == s2.sentenceId.fromMaybe("");
    };
    get isSentence() {
        return this.currentSentenceId.value !== Nothing.of().value
            && !this.isWord;
    }
    get isWord() {
        return this.currentWordId.value !== Nothing.of().value;
    }
    static of = (wordId) => (sentenceId) => (arethusa) => {
        return new ViewState(MaybeT.of(wordId), MaybeT.of(sentenceId), MaybeT.of(arethusa));
    };
    get sentenceId() {
        return this._sentenceId;
    }
    static sentenceId = (vs) => {
        return vs.sentenceId;
    };
    static setCurrentSentenceId = (value) => (s) => {
        s._sentenceId = value;
    };
    static setCurrentWordId = (value) => (s) => {
        s._tokenId = value;
    };
    get viewType() {
        if (this.isWord) {
            return ViewType.Word;
        }
        if (this.isSentence) {
            return ViewType.Sentence;
        }
        return ViewType.Unknown;
    }
    get maybeViewType() {
        if (this.isWord) {
            return MaybeT.of(ViewType.Word);
        }
        if (this.isSentence) {
            return MaybeT.of(ViewType.Sentence);
        }
        return Nothing.of();
    }
    static viewType = (vs) => {
        return vs.viewType;
    };
}
