class TextState {
    _viewState;
    _sentenceVS = Nothing.of();
    _treeState;
    _inputPlainText;
    _inputArethusa;
    _outputArethusa;
    _epidoc;
    static inputArethusaDeep = (state) => {
        return state._inputArethusa.bind(ArethusaDoc.deepcopy);
    };
    static outputArethusaDeep = (state) => {
        return state._outputArethusa.bind(ArethusaDoc.deepcopy);
    };
    static outputArethusa = (state) => {
        return state._outputArethusa;
    };
    get outputArethusa() {
        return this._outputArethusa;
    }
    static arethusaXML = (state) => {
        return MaybeT.of(state)
            .bind(TextState.outputArethusaDeep)
            .fmap(ArethusaDoc.toXMLStr);
    };
    constructor(viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) {
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
    static deepcopy = (ts) => {
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
    static epidocDeep = (state) => {
        return state._epidoc.bind(EpiDoc.deepcopy);
    };
    get hasNoArethusa() {
        return this._outputArethusa.value === Nothing.of().value;
    }
    static hasNothing = (s) => {
        return s.hasNoArethusa;
    };
    static maybeOf = (viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) => {
        return MaybeT.of(TextState.of(viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc));
    };
    static of = (viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) => {
        return new TextState(viewState, sentenceVS, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc);
    };
    static outputArethusaSentenceIds = (ts) => {
        const sentenceIds = ts
            .outputArethusa
            .fmap(ArethusaDoc.sentences)
            .fromMaybe([])
            .map(ArethusaSentence.id);
        const sentenceIdsNoNothings = Arr
            .removeNothings(sentenceIds);
        return sentenceIdsNoNothings;
    };
    static plainText = (s) => {
        return s._inputPlainText;
    };
    static sentenceVSDeep = (s) => {
        return s._sentenceVS.fmap(SentenceViewState.deepcopy);
    };
    get sentenceVS() {
        return this._sentenceVS;
    }
    static sentenceVS = (s) => {
        return s._sentenceVS;
    };
    static setArethusa = (value) => (s) => {
        s._outputArethusa = value;
    };
    static setSentenceVS = (svs) => (ts) => {
        ts._sentenceVS = svs;
    };
    static setViewState = (vs) => (s) => {
        s._viewState = MaybeT.of(vs);
    };
    static treeStateDeep = (ts) => {
        return ts
            ._treeState
            .fmap(TreeState.deepcopy);
    };
    updateTreeState = (ts) => {
        TextState.updateTreeState(ts)(this);
    };
    static updateTreeState = (treeState) => (textState) => {
        textState._treeState = treeState;
    };
    updateViewState = (vs) => {
        this._viewState = MaybeT.of(vs);
    };
    get viewState() {
        return this._viewState;
    }
    static viewStateDeep = (s) => {
        return s._viewState.fmap(ViewState.deepcopy);
    };
    static viewState = (s) => {
        return s.viewState;
    };
}
