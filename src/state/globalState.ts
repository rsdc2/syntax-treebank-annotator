class GlobalState {
    _textStateIO: Maybe<TextStateIO>
    _treeStateIO: Maybe<TreeStateIO>
    _keysPressedInputArethusa: number = 0
    _keysPressedInputEpiDoc: number = 0
    _keysPressedInputText: number = 0
    _simulation: d3.Simulation<ITreeNode, undefined>


    constructor() {
        this._textStateIO = Nothing.of<TextStateIO>()
        this._treeStateIO = Nothing.of<TreeStateIO>()
    }


    get simulation() {
        return this._simulation
    }

    set simulation(value: d3.Simulation<ITreeNode, undefined>) {
        this._simulation = value
    }

    get textStateIO() {
        return this._textStateIO
    }

    set textStateIO(value: Maybe<TextStateIO>) {
        this._textStateIO = value
    }

    get treeStateIO(): Maybe<TreeStateIO> {
        return this._treeStateIO
    }

    set treeStateIO(value: Maybe<TreeStateIO>) {
        this._treeStateIO = value
    }

    createTextStateIO = (
        arethusa: Maybe<ArethusaDoc>,
        epidoc: Maybe<EpiDoc>,
        plainText: Maybe<string>
    ) => 
    {
        this.textStateIO = MaybeT.of(
            TextStateIO.of(
                arethusa.fmap(ViewState.of("1")("1")),
                Nothing.of(),
                Nothing.of(),
                plainText,
                arethusa,
                arethusa,
                epidoc
            )
        )

    }

    createTreeStateIO = () => {
        this.treeStateIO = this
            .textStateIO
            .bindErr("No text state.", TextStateIO.currentSentence)
            .fmapErr("No current sentence", ArethusaSentence.toTreeSentState)
            .fmapErr("No tree sentence state.", TreeStateIO.of)
    }

    graph = () => {
        this.treeStateIO.fmap(Graph.graph)
    }

    // pressInputArethusaKey = () => {
    //     this._keysPressedInputArethusa += 1
    //     if (this._keysPressedInputArethusa % 5 == 0) {
    //         this._textStateIO.fmap(TextStateIO.pushInputArethusa(Frontend.inputArethusa))
    //     }
    // }

    // pressInputEpiDocKey = () => {
    //     this._keysPressedInputEpiDoc += 1
    //     if (this._keysPressedInputEpiDoc % 5 == 0) {
    //         this._textStateIO.fmap(TextStateIO.pushEpiDoc(Frontend.epidoc))
    //     }
    // }

    // pressInputArethusaKey = () => {
    //     this._keysPressed += 1
    //     if (this._keysPressed % 5 == 0) {
    //         this._textStateIO.fmap(TextStateIO.push)
    //     }
    // }

    redo = () => {
        this.textStateIO.fmap(TextStateIO.redo)
    }

    undo = () => {
        this.textStateIO.fmap(TextStateIO.undo)
    }
}