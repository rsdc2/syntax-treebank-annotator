class GlobalState {
    constructor() {
        this._keysPressedInputArethusa = 0;
        this._keysPressedInputEpiDoc = 0;
        this._keysPressedInputText = 0;
        this.createTextStateIO = (arethusa, epidoc, plainText) => {
            this.textStateIO = MaybeT.of(TextStateIO.of(arethusa.fmap(ViewState.of("1")("1")), Nothing.of(), Nothing.of(), plainText, arethusa, arethusa, epidoc));
        };
        this.createTreeStateIO = () => {
            this.treeStateIO = this
                .textStateIO
                .bindErr("No text state.", TextStateIO.currentSentence)
                .bindErr("No current sentence", ArethusaSentence.toTreeSentState)
                .fmapErr("No tree sentence state.", TreeStateIO.of);
        };
        this.graph = () => {
            this.treeStateIO.fmap(Graph.graph);
        };
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
        this.redo = () => {
            this.textStateIO.fmap(TextStateIO.redo);
        };
        this.undo = () => {
            this.textStateIO.fmap(TextStateIO.undo);
        };
        this._textStateIO = Nothing.of();
        this._treeStateIO = Nothing.of();
    }
    get simulation() {
        return this._simulation;
    }
    set simulation(value) {
        this._simulation = value;
    }
    get textStateIO() {
        return this._textStateIO;
    }
    set textStateIO(value) {
        this._textStateIO = value;
    }
    get treeStateIO() {
        return this._treeStateIO;
    }
    set treeStateIO(value) {
        this._treeStateIO = value;
    }
}
