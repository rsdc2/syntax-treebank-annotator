var ViewType;
(function (ViewType) {
    ViewType["Word"] = "word";
    ViewType["Sentence"] = "sentence";
    ViewType["Unknown"] = "unknown";
})(ViewType || (ViewType = {}));
class ViewState {
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
    get isSentence() {
        return this.currentSentenceId.value !== Nothing.of().value
            && !this.isWord;
    }
    get isWord() {
        return this.currentWordId.value !== Nothing.of().value;
    }
    get sentenceId() {
        return this._sentenceId;
    }
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
}
ViewState.currentSentenceId = (vs) => {
    return vs._sentenceId;
};
ViewState.currentTokenId = (state) => {
    return state._tokenId;
};
ViewState.deepcopy = (s) => {
    return new ViewState(s._tokenId, s._sentenceId, s._arethusa.bind(ArethusaDoc.deepcopy));
};
ViewState.sentencesSame = (s1) => (s2) => {
    return s1.sentenceId.unpackT("") == s2.sentenceId.unpackT("");
};
ViewState.of = (wordId) => (sentenceId) => (arethusa) => {
    return new ViewState(MaybeT.of(wordId), MaybeT.of(sentenceId), MaybeT.of(arethusa));
};
ViewState.sentenceId = (vs) => {
    return vs.sentenceId;
};
ViewState.setCurrentSentenceId = (value) => (s) => {
    s._sentenceId = value;
};
ViewState.setCurrentWordId = (value) => (s) => {
    s._tokenId = value;
};
ViewState.viewType = (vs) => {
    return vs.viewType;
};
