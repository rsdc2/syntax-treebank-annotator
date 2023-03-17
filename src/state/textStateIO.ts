class TextStateIO {
    _textStates: TextState[] = []
    _currentStateIdx: Maybe<number> = Nothing.of<number>()

    appendNewSentenceToArethusa() {
        TextStateIO.appendNewSentenceToArethusa(this)
    }

    static appendNewSentenceToArethusa = (s:TextStateIO) => {
        const maybeS = MaybeT.of(s)

        const newSentenceId = maybeS
            .bind(TextStateIO.outputArethusa)
            .fmap(Arethusa.newNextSentenceId)

        s.pushOutputArethusa 
            (false) 
            (new ViewState(Nothing.of(), newSentenceId, s.outputArethusaP)) 
            (s.treeState) 
            (maybeS
                .bind(TextStateIO.outputArethusa)
                .bind(Arethusa.appendSentence)
            )
    }

    appendNewState = (ext: boolean) => (state: TextState) => {

        const s = MaybeT.of(state)

        const newState = TextState.maybeOf(
            s.bind(TextState.viewStateDeep),
            s.bind(TextState.treeStateDeep),
            s.bind(TextState.plainText),
            s.bind(TextState.inputArethusaDeep),
            s.bind(TextState.outputArethusaDeep),
            s.bind(TextState.epidocDeep)
        )
        
        if (!newState.fmap(TextState.hasNothing).unpackT(true)) {
            newState.fmap(this.push)
            this.currentStateIdx = this.lastStateIdx
        }
        
        this.show(ext)
    }

    static appendNewState = (ext: boolean) => (state: TextState) => 
        (tsio: TextStateIO) =>
    {
        const s = MaybeT.of(state)

        const newState = TextState.maybeOf(
            s.bindErr("Error.", TextState.viewStateDeep),
            s.bindErr("Error.", TextState.treeStateDeep),
            s.bindErr("Error.", TextState.plainText),
            s.bindErr("Error.", TextState.inputArethusaDeep),
            s.bindErr("Error.", TextState.outputArethusaDeep),
            s.bindErr("Error.", TextState.epidocDeep)
        )
        
        // if (!newState.fmap(TextState.hasNothing).unpackT(true)) {
            newState.fmap(tsio.push)
            tsio.currentStateIdx = tsio.lastStateIdx
        // }
        
        tsio.show(ext)   
        return 0
    }
    
    appendNewWordToSentence() {
        TextStateIO.appendNewWordToSentence(this)
    }

    static appendNewWordToSentence = (s: TextStateIO) => {
        const appendWord = s
            .currentSentenceId
            .fmap(Arethusa.appendWordToSentence ({}))

        const newArethusa = s
            .outputArethusaP
            .applyBind(appendWord)

        const getSentence = s
            .currentSentenceId
            .fmap(Arethusa.sentenceById)

        const nextWordId = newArethusa
            .applyBind(getSentence)
            .bind(ArethusaSentence.lastWordId)

        const newViewState = new ViewState (nextWordId, s.currentSentenceId, newArethusa)
    
        s.pushOutputArethusa 
            (false) 
            (newViewState) 
            (s.treeState) 
            (newArethusa)
    } 

    get outputArethusaP () {
        return TextStateIO.outputArethusa(this)
    }

    static outputArethusa = (s: TextStateIO): Maybe<Arethusa> => {
        return s
            .currentState
            .bind(TextState.outputArethusaDeep)
    }

    get outputArethusaXML () {
        return this
            .outputArethusaP
            .bind(DXML.nodeXMLStr)
    }

    changeArethusaSentence = (ext: boolean) => (newS: ArethusaSentence) => {
        TextStateIO.changeArethusaSentence (ext) (this) (newS) 
    }

    static changeArethusaSentence = (ext: boolean)  => (s: TextStateIO) => (newS: ArethusaSentence) => {
        const newArethusa = s
            .outputArethusaP
            .bind(flip(Arethusa.replaceSentence)(newS))

        s.pushOutputArethusa
            (ext)
            (new ViewState(Nothing.of(), s.viewState.bind(ViewState.currentSentenceId), s.outputArethusaP)) 
            (s.treeState)
            (newArethusa)       
    }

    changeView = (wordId: Maybe<string>) => (sentenceId: Maybe<string>) => {
        TextStateIO.changeView(wordId)(sentenceId)(this)
    }

    static changeView = (wordId: Maybe<string>) => (sentenceId: Maybe<string>) => (s: TextStateIO) => {
        const newVS = MaybeT.of(new ViewState(wordId, sentenceId, s.outputArethusaP))
        s.currentState
            .applyFmap(newVS.fmap(TextState.setViewState))

        s.show(false)
    }

    constructor (initialState: TextState) {
        this.appendNewState(false)(initialState)
    }

    get currentState () {
        return TextStateIO.currentState(this)
    }

    static currentState = (s: TextStateIO) => {
        return MaybeT.of (s.states[s.currentStateIdx.unpackT(-1)])
    }

    get currentStateIdx(): Maybe<number> {
        return this._currentStateIdx
    }

    set currentStateIdx (value: Maybe<number>) {
        const createBoundedNum = this
            .lastStateIdx
            .fmap(BoundedNum.of(0))

        this._currentStateIdx = value
            .applyFmap(createBoundedNum)
            .fmap(BoundedNum.value)
    }

    get currentSentence () {
        return TextStateIO.currentSentence(this)
    }

    static currentSentence = (textStateIO: TextStateIO) => {
        const getSent = textStateIO
            .currentSentenceId
            .fmap(Arethusa.sentenceById)

        const sent = textStateIO
            .outputArethusaP
            .applyBind(getSent)

        if (sent.isNothing) {
            return textStateIO
                .outputArethusaP
                .bind(Arethusa.lastSentence)
        }

        return sent
    }

    get currentSentenceId () {
        return this
            .viewState
            .bind(ViewState.currentSentenceId)
    }

    get currentWord () {
        return TextStateIO.currentWord(this)
    }

    static currentWord = (s: TextStateIO) => {

        const getWord = s
            .currentWordId
            .fmap(Arethusa.wordById) 
        return s
            .outputArethusaP
            .applyBind(getWord)

    }

    get currentWordId () {
        return TextStateIO.currentWordId(this)
    }

    static currentWordId = (s: TextStateIO) => {
        return s
            .viewState
            .bind(ViewState.currentWordId)

    }

    get epidoc () {
        return this
            .currentState
            .bind(TextState.epidocDeep)
    }

    epidocToArethusa () {
        TextStateIO.epidocToArethusa(this)
    }

    static epidocToArethusa = (s: TextStateIO) => {
        s.pushEpiDoc(Frontend.epidoc)
        
        const newArethusa = s
            .epidoc
            .bind(Conversion.epidocToArethusa)

        s.pushOutputArethusa
            (false)
            (new ViewState (Nothing.of(), Nothing.of(), newArethusa))
            (Nothing.of())
            (newArethusa)
    }

    get epidocXML () {
        return this
            .epidoc
            .fmap(EpiDoc.toXMLStr)
    }

    redo = () => {
        TextStateIO.redo(this)
    }

    static redo = (textStateIO: TextStateIO) => {
        textStateIO.currentStateIdx = textStateIO.nextIdx
        textStateIO.show(false)
    }

    formatInputArethusa = () => {
        TextStateIO.formatInputArethusa(this)
    }

    static formatInputArethusa = (s: TextStateIO) => {
        s.pushInputArethusa(Frontend.inputArethusa)

        const formattedXML = s
            .inputArethusaXML
            .fmapErr("No input Arethusa XML", XML.fromXMLStr)
            .fmapErr("No input Arethusa XML string", XMLFormatter.prettifyFromRoot(true))
            .fmapErr("No prettified input Arethusa XML string", XML.toStr)
    
        const newInputArethusa = formattedXML
            .bindErr("No formatted input Arethusa XML string.", Arethusa.fromXMLStr)

        s.pushInputArethusa(newInputArethusa)
    } 

    formatInputEpiDoc = () => {
        TextStateIO.formatInputEpiDoc(this)
    }

    static formatInputEpiDoc = (s: TextStateIO) => {
        s.pushEpiDoc(Frontend.epidoc)

        const formattedXML = s
            .epidocXML
            .fmapErr("No EpiDoc XML", XML.fromXMLStr)
            .fmapErr("No EpiDoc XML string", XMLFormatter.prettifyFromRoot(true))
            .fmapErr("No prettified EpiDoc XML string", XML.toStr)
    
        const newEpiDoc = formattedXML
            .bindErr("No formatted EpiDoc XML string.", EpiDoc.fromXMLStr)

        s.pushEpiDoc(newEpiDoc)
    } 

    get highlightedNodeStr () {
        switch (this
            .viewState
            .fmap(ViewState.viewType)
            .unpackT(ViewType.Unknown))
            {
            case (ViewType.Word): {
                const getWord = this
                    .currentWordId
                    .fmap(Arethusa.wordById)
                
                return this
                    .outputArethusaP
                    .applyBind(getWord)
                    .bind(DXML.nodeXMLStr)
            }

            case (ViewType.Sentence): {
                const getSentence = this
                    .currentSentenceId
                    .fmap(Arethusa.sentenceById)
                
                return this
                    .outputArethusaP
                    .applyBind(getSentence)
                    .bind(DXML.nodeXMLStr)
            }

            default: {
                return Nothing.of<string>()
            }
        }
    }


    get inputArethusaP () {
        return TextStateIO.inputArethusa(this)
    }

    static inputArethusa = (s: TextStateIO): Maybe<Arethusa> => {
        return s
            .currentState
            .bind(TextState.inputArethusaDeep)
    }

    get inputArethusaXML () {
        return this
            .inputArethusaP
            .bind(DXML.nodeXMLStr)
    }

    insertSentence = () => {
        return TextStateIO.insertSentence(this)
    }

    static insertSentence = (s: TextStateIO) => {
        const newArethusa = s
            .outputArethusaP
            .applyBind(s.currentSentenceId.fmap(Arethusa.insertSentenceBefore))  

        s.pushOutputArethusa 
            (false)
            (new ViewState(s.currentWordId, Nothing.of(), newArethusa)) 
            (s.treeState)
            (newArethusa)
    }

    get isLastState () {
        return MaybeT.comp (this.currentStateIdx) (Num.eq) (this.lastStateIdx) 
    }

    moveWordDown = () => {
        TextStateIO.moveWordDown(this)
    }

    static moveWordDown = (s: TextStateIO) => {
        s.moveWord (ArethusaSentence.moveWordDown)
    }

    moveWordUp = () => {
        TextStateIO.moveWordUp(this)
    }

    static moveWordUp = (s: TextStateIO) => {
        s.moveWord (ArethusaSentence.moveWordUp)
    }

    moveWord = (moveFunc: (id: string) => (sentence: ArethusaSentence) => Maybe<Arethusa>) => {
        const moveWord = this
            .currentWordId
            .fmap(moveFunc)

        const getSentence = this
            .currentSentenceId
            .fmap(Arethusa.sentenceById)

        const sentence = this
            .currentState
            .bind(TextState.outputArethusaDeep)
            .applyBind(getSentence)

        const newArethusa = sentence
            .applyBind(moveWord)

        this.pushOutputArethusa 
            (false) 
            (new ViewState(this.currentWordId, this.currentSentenceId, newArethusa)) 
            (this.treeState) (newArethusa)

    }

    moveWordToNextSentence = () => {
        TextStateIO.moveWordToNextSentence(this)
    }

    static moveWordToNextSentence = (s: TextStateIO) => {
        const pushWordToNextSentence = s
            .currentWordId
            .fmap(Arethusa.moveWordToNextSentence)
    
        const newArethusa = s
            .outputArethusaP
            .applyBind(pushWordToNextSentence) as Maybe<Arethusa>
        
        s.pushOutputArethusa 
            (false) 
            (new ViewState(s.currentWordId, Nothing.of(), newArethusa)) 
            (s.treeState) 
            (newArethusa)   
    }

    moveWordToPrevSentence = () => {
        TextStateIO.moveWordToPrevSentence(this)
    }

    static moveWordToPrevSentence = (s: TextStateIO) => {
        const pushWordToPrevSentence = s
            .currentWordId
            .fmap(Arethusa.moveWordToPrevSentence)

        const newArethusa = s
            .outputArethusaP
            .applyBind(pushWordToPrevSentence)

        s.pushOutputArethusa 
            (false) 
            (new ViewState(s.currentWordId, Nothing.of(), newArethusa)) 
            (s.treeState) 
            (newArethusa)  
    }

    get nextIdx () {
        return $$ (MaybeT.of) (this
            .currentStateIdx
            .applyFmap( this.lastStateIdx.fmap(BoundedNum.of(0)) )
            .fmap( BoundedNum.increment )
            .fmap( BoundedNum.value )
            .unpack(1))
    }

    nextState = () => {
        const f = flip (Arr.byIdx)
        
        return this
            .nextIdx
            .bind (f(this.states))
    }

    static of = (
        viewState: Maybe<ViewState>,
        treeState: Maybe<TreeState>,
        inputPlainText: Maybe<string>,
        inputArethusa: Maybe<Arethusa>,
        outputArethusa: Maybe<Arethusa>,
        epidoc: Maybe<EpiDoc>
    ) => 
    {
        const s = TextState.of(
            viewState.fmap(ViewState.deepcopy),
            treeState.fmap(TreeState.deepcopy),
            inputPlainText,
            inputArethusa,
            outputArethusa,
            epidoc
        )
    
        return new TextStateIO (s)
    }

    get prevIdx () {
        return this
            .currentStateIdx
            .applyFmap( this.lastStateIdx.fmap(BoundedNum.of(0)) )
            .fmap( BoundedNum.decrement )
            .fmap( BoundedNum.value )
    }

    prevState = () => {
        const f = flip (Arr.byIdx)
        
        return this
            .prevIdx
            .bind (f(this.states))
    }

    push = (s: TextState) => {
        if (!this.isLastState) this.removePostStates()

        this._textStates = Arr.push (s) (this._textStates)
        this._currentStateIdx = MaybeT.ofNonNeg(Arr.len(this._textStates) - 1)
    }

    pushInputArethusa = (arethusa: Maybe<Arethusa>) => {
        TextStateIO.pushInputArethusa(arethusa)(this)
    }

    static pushInputArethusa = (arethusa: Maybe<Arethusa>) => 
        (s: TextStateIO) => {
        s.appendNewState(false) (TextState.of(
            s.viewState,
            s.treeState,
            s.currentState.bind(TextState.plainText),
            arethusa,
            arethusa,
            s.currentState.bind(TextState.epidocDeep)
        ))

    }

    private pushOutputArethusa = 
        (ext: boolean) => 
        (viewState: ViewState) => 
        (treeState: Maybe<TreeState>) => 
        (outputArethusa: Maybe<Arethusa>) =>
    {
        this.appendNewState 
            (ext) 
            (TextState.of(
                MaybeT.of(viewState),
                treeState,
                this.currentState
                    .bind(TextState.plainText),
                this.currentState
                    .bind(TextState.inputArethusaDeep),
                outputArethusa,
                this.currentState
                    .bind(TextState.epidocDeep)
        ))
    }   

    pushEpiDoc = (epidoc: Maybe<EpiDoc>) => {
        TextStateIO.pushEpiDoc(epidoc)(this)
    }

    static pushEpiDoc = (epidoc: Maybe<EpiDoc>) => 
        (s: TextStateIO) => {
            s.appendNewState(false) (TextState.of(
                s.viewState,
                s.treeState,
                s.currentState.bind(TextState.plainText),
                s.currentState.bind(TextState.inputArethusaDeep),
                s.currentState.bind(TextState.outputArethusaDeep),
                epidoc
            )
        )
    } 

    pushPlainText = (plainText: Maybe<string>) => {
        TextStateIO.pushPlainText(plainText)(this)
    }

    static pushPlainText = (plainText: Maybe<string>) => 
        (s: TextStateIO) => {
            s.appendNewState(false) (TextState.of(
                s.viewState,
                s.treeState,
                plainText,
                s.currentState.bind(TextState.inputArethusaDeep),
                s.currentState.bind(TextState.outputArethusaDeep),
                s.currentState.bind(TextState.epidocDeep)
            )
        )
    } 

    private removePostStates = () => {
        const getSlice = this
            .currentStateIdx
            .fmap(Num.add(1))
            .fmap(Arr.slice<TextState>(0))

        this._textStates = MaybeT.of<TextState[]>(this._textStates)
            .applyFmap(getSlice)
            .unpackT([])
    }

    removeSentence = () => {
        TextStateIO.removeSentence(this)
    }

    static removeSentence = (s: TextStateIO) => {
        const removeSentence = s
            .currentSentenceId
            .fmap(Arethusa.removeSentenceById)

        const newArethusa = s
            .outputArethusaP
            .applyBind(removeSentence)

        s.pushOutputArethusa 
            (false)
            (new ViewState(Nothing.of(), Nothing.of(), newArethusa)) 
            (s.treeState)
            (newArethusa)
    }

    removeArethusaWord = () => {
        TextStateIO.removeArethusaWord(this)
    }

    static removeArethusaWord = (s: TextStateIO) => {
        const removeWord = s
            .currentSentenceId
            .applyFmap(
                s.currentWordId
                    .fmap(Arethusa.removeWordByWordAndSentenceId)
            )
        
        const newArethusa = s
            .outputArethusaP
            .applyBind(removeWord)

        s.pushOutputArethusa 
            (false)
            (new ViewState(Nothing.of(), Nothing.of(), newArethusa)) 
            (s.treeState)
            (newArethusa)
    }

    splitSentenceAtCurrentWord = () => {
        return TextStateIO.splitSentenceAtCurrentWord(this)
    }

    static splitSentenceAtCurrentWord = (s: TextStateIO) => {
        const splitAtWord = s
            .currentWordId
            .fmap(Arethusa.splitSentenceAt)

        const newArethusa = s
            .outputArethusaP
            .applyBind(splitAtWord)

        s.pushOutputArethusa 
            (false)
            (new ViewState(s.currentWordId, Nothing.of(), newArethusa)) 
            (s.treeState)
            (newArethusa)
    }

    undo = () => {
        TextStateIO.undo(this)
    }

    static undo = (s: TextStateIO) => {
        s.currentStateIdx = s.prevIdx
        s.show(false)
    }

    get sentencesRep () {
        // sentences representation

        const sentences = this
            .outputArethusaP
            .fmap(Arethusa.sentences)
            .unpackT([])

        const sentenceStrs = sentences
            .map( (s: ArethusaSentence) => {
                const words = ArethusaSentence
                    .words(s)
                    .map(ArethusaWord.form)
                    .reduce(Arr.removeNothingReduce, [] as string[])
                    
                return words.join(" ")
            })

        return sentenceStrs
            .join(". ")
            .concat(".")
    }

    private show = (ext: boolean) => {
        EpiDoc.pushToFrontend(this)
        Arethusa.pushToFrontend(this)
        Frontend.pushPlainTextToFrontend(this)

        SentencesDiv.setText(this.sentencesRep)

        // Update tree state

        const treeStateFunc = MaybeT.of(globalState.simulation).isNothing ? 
            ArethusaSentence.toTreeSentState :
            ArethusaSentence.toTreeSentStateWithNodesFromExistingTree(globalState.simulation.nodes())


        const treeState = this.currentSentence.isNothing ? 
            MaybeT.of(TreeState.of(0) ("1") ([]) ([]) (ClickState.none())) :
            this.currentSentence.bind(treeStateFunc)

        // Convert wordId to treeNodeId
        const getTreeNodeId = this
            .currentWordId
            .fmap(Str.toNum)
            .fmap(TreeState.tokenIdToTreeNodeId)

        const treeNodeId = treeState.applyBind(getTreeNodeId)
            .fmap(Str.fromNum)

        const clickState = ClickState.of(treeNodeId)(ElementType.NodeLabel)(ClickType.Left)
        treeState.fmap(TreeState.setClickState(clickState))
    
        if (!ext) {
            globalState
                .treeStateIO
                .applyFmap(
                    treeState
                        .fmapErr("No tree state", TreeStateIO.push(true)(!ext)))
            
            
            this.currentState
                .fmap(TextState.updateTreeState(treeState))

        }
    }    

    get lastStateIdx() {
        return MaybeT.ofNonNeg(Arr.len(this.states) - 1)
    }

    get states() {
        return this._textStates
    }

    get treeState() {
        return this.currentState.bind(TextState.treeStateDeep)
    }

    get viewState() {
        return this.currentState.bind(TextState.viewState)
    }

}

