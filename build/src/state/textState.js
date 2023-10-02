class TextState {
    get outputArethusa() {
        return this._outputArethusa;
    }
    constructor(viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) {
        this._sentenceVS = Nothing.of();
        this.updateTreeState = (ts) => {
            TextState.updateTreeState(ts)(this);
        };
        this.updateViewState = (vs) => {
            this._viewState = MaybeT.of(vs);
        };
        this._viewState = viewState;
        this._treeState = treeState;
        this._inputPlainText = inputPlainText;
        this._inputArethusa = inputArethusa;
        this._outputArethusa = outputArethusa
            .fmap(DXML.node)
            .fmap(XMLFormatter.prettifyFromRoot(true))
            .bind(ArethusaDoc.fromNode);
        this._epidoc = epidoc;
    }
    get hasNoArethusa() {
        return this._outputArethusa.value === Nothing.of().value;
    }
    get sentenceVS() {
        return this._sentenceVS;
    }
    get viewState() {
        return this._viewState;
    }
}
TextState.inputArethusaDeep = (state) => {
    return state._inputArethusa.bind(ArethusaDoc.deepcopy);
};
TextState.outputArethusaDeep = (state) => {
    return state._outputArethusa.bind(ArethusaDoc.deepcopy);
};
TextState.outputArethusa = (state) => {
    return state._outputArethusa;
};
TextState.arethusaXML = (state) => {
    return MaybeT.of(state)
        .bind(TextState.outputArethusaDeep)
        .fmap(ArethusaDoc.toXMLStr);
};
TextState.deepcopy = (ts) => {
    const newViewState = ts
        ._viewState
        .fmap(ViewState.deepcopy);
    const newSentenceVS = ts
        ._sentenceVS
        .fmap(SentenceViewState.deepcopy);
    const newTreeState = ts
        ._treeState
        .fmap(TreeState.deepcopy);
    const newOutputArethusa = MaybeT.of(ts)
        .bind(TextState.outputArethusaDeep)
        .bind(ArethusaDoc.deepcopy);
    const newInputArethusa = MaybeT.of(ts)
        .bind(TextState.outputArethusaDeep)
        .bind(ArethusaDoc.deepcopy);
    const newEpiDoc = MaybeT.of(ts)
        .bind(TextState.epidocDeep)
        .bind(EpiDoc.deepcopy);
    return TextState.maybeOf(newViewState, newSentenceVS, newTreeState, ts._inputPlainText, newInputArethusa, newOutputArethusa, newEpiDoc);
};
TextState.epidocDeep = (state) => {
    return state._epidoc.bind(EpiDoc.deepcopy);
};
TextState.hasNothing = (s) => {
    return s.hasNoArethusa;
};
TextState.maybeOf = (viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) => {
    return MaybeT.of(TextState.of(viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc));
};
TextState.of = (viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) => {
    return new TextState(viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc);
};
TextState.outputArethusaSentenceIds = (ts) => {
    const sentenceIds = ts
        .outputArethusa
        .fmap(ArethusaDoc.sentences)
        .fromMaybe([])
        .map(ArethusaSentence.id);
    const sentenceIdsNoNothings = Arr
        .removeNothings(sentenceIds);
    return sentenceIdsNoNothings;
};
TextState.plainText = (s) => {
    return s._inputPlainText;
};
TextState.sentenceVSDeep = (s) => {
    return s._sentenceVS.fmap(SentenceViewState.deepcopy);
};
TextState.sentenceVS = (s) => {
    return s._sentenceVS;
};
TextState.setArethusa = (value) => (s) => {
    s._outputArethusa = value;
};
TextState.setSentenceVS = (svs) => (ts) => {
    ts._sentenceVS = svs;
};
TextState.setViewState = (vs) => (s) => {
    s._viewState = MaybeT.of(vs);
};
TextState.treeStateDeep = (ts) => {
    return ts
        ._treeState
        .fmap(TreeState.deepcopy);
};
TextState.updateTreeState = (treeState) => (textState) => {
    textState._treeState = treeState;
};
TextState.viewStateDeep = (s) => {
    return s._viewState.fmap(ViewState.deepcopy);
};
TextState.viewState = (s) => {
    return s.viewState;
};
