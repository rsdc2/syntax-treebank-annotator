
class TextState {

    _viewState: Maybe<ViewState>
    _treeState: Maybe<TreeState>
    _inputPlainText: Maybe<string>
    _inputArethusa: Maybe<ArethusaDoc>
    _outputArethusa: Maybe<ArethusaDoc>
    _epidoc: Maybe<EpiDoc>

    static inputArethusaDeep = (state: TextState) => {
        return state._inputArethusa.bind(ArethusaDoc.deepcopy)
    }

    static outputArethusaDeep = (state: TextState) => {
        return state._outputArethusa.bind(ArethusaDoc.deepcopy)
    }

    static arethusaXML = (state: TextState) => {
        return MaybeT.of(state)
            .bind(TextState.outputArethusaDeep)
            .fmap(ArethusaDoc.toXMLStr)
    }

    constructor (
        viewState: Maybe<ViewState>,
        treeState: Maybe<TreeState>,
        inputPlainText: Maybe<string>,
        inputArethusa: Maybe<ArethusaDoc>,
        outputArethusa: Maybe<ArethusaDoc>,
        epidoc: Maybe<EpiDoc>
    ) {
        this._viewState = viewState
        this._treeState = treeState
        this._inputPlainText = inputPlainText
        this._inputArethusa = inputArethusa
        this._outputArethusa = outputArethusa
            .fmap(DXML.node)
            .fmap(XMLFormatter.prettifyFromRoot(true))
            .bind(ArethusaDoc.fromNode)    
        this._epidoc = epidoc
    }

    static deepcopy = (state: TextState) => {
        const newViewState = state
            ._viewState
            .fmap(ViewState.deepcopy)

        const newTreeState = state
            ._treeState
            .fmap(TreeState.deepcopy)

        const newOutputArethusa = MaybeT.of(state)
            .bind(TextState.outputArethusaDeep)
            .bind(ArethusaDoc.deepcopy)

        const newInputArethusa = MaybeT.of(state)
            .bind(TextState.outputArethusaDeep)
            .bind(ArethusaDoc.deepcopy)

        const newEpiDoc = MaybeT.of(state)
            .bind(TextState.epidocDeep)
            .bind(EpiDoc.deepcopy)

        return TextState.maybeOf(
            newViewState,
            newTreeState,
            state._inputPlainText,
            newInputArethusa,
            newOutputArethusa,
            newEpiDoc
            )
    }

    static epidocDeep = (state: TextState) => {
        return state._epidoc.bind(EpiDoc.deepcopy)
    }

    get hasNoArethusa() {
        return this._outputArethusa.value === Nothing.of().value
        // || this._epidoc.value === Nothing.of().value
    }

    static hasNothing = (s: TextState) => {
        return s.hasNoArethusa
    }

    static maybeOf = (
        viewState: Maybe<ViewState>,
        treeState: Maybe<TreeState>,
        inputPlainText: Maybe<string>,
        inputArethusa: Maybe<ArethusaDoc>,
        outputArethusa: Maybe<ArethusaDoc>,
        epidoc: Maybe<EpiDoc>
    ) => {
        
        return MaybeT.of(
            TextState.of(
                viewState,
                treeState,
                inputPlainText,
                inputArethusa,
                outputArethusa, 
                epidoc            
            )
        )
    }

    static of = (
        viewState: Maybe<ViewState>,
        treeState: Maybe<TreeState>,
        inputPlainText: Maybe<string>,
        inputArethusa: Maybe<ArethusaDoc>,
        outputArethusa: Maybe<ArethusaDoc>,
        epidoc: Maybe<EpiDoc>        
    ) => {

        return new TextState(
                viewState,
                treeState,
                inputPlainText,
                inputArethusa,
                outputArethusa, 
                epidoc
            )
    }

    static plainText = (s: TextState) => {
        return s._inputPlainText
    }

    static setArethusa = (value: Maybe<ArethusaDoc>) => (s: TextState) => {
        s._outputArethusa = value
    }

    static setViewState = (vs: ViewState) => (s: TextState) => {
        s._viewState = MaybeT.of(vs)
    }

    static treeStateDeep = (ts: TextState) => {
        return ts
            ._treeState
            .fmap(TreeState.deepcopy)
    }

    updateTreeState = (ts: Maybe<TreeState>) => {
        TextState.updateTreeState(ts)(this)
    }

    static updateTreeState = 
        (treeState: Maybe<TreeState>) => 
        (textState: TextState) => {
        textState._treeState = treeState
    }

    updateViewState = (vs: ViewState) => {
        this._viewState = MaybeT.of(vs)
    }

    get viewState () {
        return this._viewState
    }

    static viewStateDeep = (s: TextState) => {
        return s._viewState.fmap(ViewState.deepcopy)
    }

    static viewState = (s: TextState) => {
        return s.viewState
    }

}
