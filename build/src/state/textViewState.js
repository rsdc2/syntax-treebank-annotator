var ViewType;
(function (ViewType) {
    ViewType["Word"] = "word";
    ViewType["Sentence"] = "sentence";
    ViewType["Unknown"] = "unknown";
})(ViewType || (ViewType = {}));
class ViewState {
    constructor(wordId, sentenceId, arethusa) {
        const getWordId = wordId.fmap(ArethusaDoc.sentenceIdByWordId);
        const sentenceIdFromWord = arethusa
            .applyBind(getWordId);
        this._sentenceId = wordId.isNothing ?
            sentenceId :
            sentenceIdFromWord;
        this._wordId = wordId;
        this._arethusa = arethusa.bind(ArethusaDoc.deepcopy);
    }
    get currentWordId() {
        return this._wordId;
    }
    set currentWordId(value) {
        this._wordId = value;
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
ViewState.currentWordId = (state) => {
    return state._wordId;
};
ViewState.deepcopy = (s) => {
    return new ViewState(s._wordId, s._sentenceId, s._arethusa.bind(ArethusaDoc.deepcopy));
};
ViewState.of = (wordId) => (sentenceId) => (arethusa) => {
    return new ViewState(MaybeT.of(wordId), MaybeT.of(sentenceId), MaybeT.of(arethusa));
};
ViewState.setCurrentSentenceId = (value) => (s) => {
    s._sentenceId = value;
};
ViewState.setCurrentWordId = (value) => (s) => {
    s._wordId = value;
};
ViewState.viewType = (vs) => {
    return vs.viewType;
};
