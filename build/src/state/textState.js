class TextState {
    constructor(viewState, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) {
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
        // || this._epidoc.value === Nothing.of().value
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
TextState.arethusaXML = (state) => {
    return MaybeT.of(state)
        .bind(TextState.outputArethusaDeep)
        .fmap(ArethusaDoc.toXMLStr);
};
TextState.deepcopy = (state) => {
    const newViewState = state
        ._viewState
        .fmap(ViewState.deepcopy);
    const newTreeState = state
        ._treeState
        .fmap(TreeState.deepcopy);
    const newOutputArethusa = MaybeT.of(state)
        .bind(TextState.outputArethusaDeep)
        .bind(ArethusaDoc.deepcopy);
    const newInputArethusa = MaybeT.of(state)
        .bind(TextState.outputArethusaDeep)
        .bind(ArethusaDoc.deepcopy);
    const newEpiDoc = MaybeT.of(state)
        .bind(TextState.epidocDeep)
        .bind(EpiDoc.deepcopy);
    return TextState.maybeOf(newViewState, newTreeState, state._inputPlainText, newInputArethusa, newOutputArethusa, newEpiDoc);
};
TextState.epidocDeep = (state) => {
    return state._epidoc.bind(EpiDoc.deepcopy);
};
TextState.hasNothing = (s) => {
    return s.hasNoArethusa;
};
TextState.maybeOf = (viewState, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) => {
    return MaybeT.of(TextState.of(viewState, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc));
};
TextState.of = (viewState, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) => {
    return new TextState(viewState, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc);
};
TextState.plainText = (s) => {
    return s._inputPlainText;
};
TextState.setArethusa = (value) => (s) => {
    s._outputArethusa = value;
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
