class TextStateIO {
    _textStates: TextState[] = []
    _currentStateIdx: Maybe<number> = Nothing.of<number>()
    
    constructor (initialState: TextState) {
        this.appendNewState(false)(initialState)
    }

    appendNewSentenceToArethusa() {
        TextStateIO.appendNewSentenceToArethusa(this)
    }

    static appendNewSentenceToArethusa = (s: TextStateIO) => {
        const maybeS = MaybeT.of(s)

        const newSentenceId = maybeS
            .bind(TextStateIO.outputArethusa)
            .fmap(ArethusaDoc.newNextSentenceId)

        s.pushOutputArethusa 
            (false) 
            (new ViewState(Nothing.of(), newSentenceId, s.outputArethusaP)) 
            (s.treeState) 
            (maybeS
                .bind(TextStateIO.outputArethusa)
                .bind(ArethusaDoc.appendSentence)
            )
    }

    appendNewState = (ext: boolean) => (state: TextState) => {

        const s = MaybeT.of(state)

        const newState = TextState.of(
            s.bind(TextState.viewStateDeep),
            state._sentenceVS.fmap(SentenceViewState.deepcopy),
            s.bind(TextState.treeStateDeep),
            s.bind(TextState.plainText),
            s.bind(TextState.inputArethusaDeep),
            s.bind(TextState.outputArethusaDeep),
            s.bind(TextState.epidocDeep)
        )

        // console.log('appendNewState', newState.outputArethusa.value?.node)

        if (newState._sentenceVS.isNothing) {
            if (this.currentState.value?._sentenceVS != null) {
                newState._sentenceVS = this
                    .currentState
                    .value
                    ?._sentenceVS
                    .fmap(SentenceViewState.deepcopy)
            }   
        }

        const maybeNS = MaybeT.of(newState)
        
        if (!maybeNS.fmap(TextState.hasNothing).unpackT(true)) {
            maybeNS.fmap(this.push)
            // console.log('Has TS')
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
            s.bindErr("Error.", TextState.sentenceVSDeep),
            s.bindErr("Error.", TextState.treeStateDeep),
            s.bindErr("Error.", TextState.plainText),
            s.bindErr("Error.", TextState.inputArethusaDeep),
            s.bindErr("Error.", TextState.outputArethusaDeep),
            s.bindErr("Error.", TextState.epidocDeep)
        )
        
        newState.fmap(tsio.push)
        tsio.currentStateIdx = tsio.lastStateIdx
        
        tsio.show(ext)   
        return 0
    }
    
    appendNewWordToSentence() {
        TextStateIO.appendNewWordToSentence(this)
    }

    static appendNewArtificialToSentence = (s: TextStateIO) => {
        const appendArtificial = s
            .currentSentenceId
            .fmap(
                ArethusaDoc.appendArtificialToSentence 
                    (ArethusaArtificial.createAttrs("0"))
            )

        const newArethusa = s
            .outputArethusaP
            .applyBind(appendArtificial)

        const getSentence = s
            .currentSentenceId
            .fmap(ArethusaDoc.sentenceById)

        const nextTokenId = newArethusa
            .applyBind(getSentence)
            .bind(ArethusaSentence.lastTokenId)

        const newViewState = new ViewState 
            (nextTokenId, s.currentSentenceId, newArethusa)
    
        s.pushOutputArethusa 
            (false) 
            (newViewState) 
            (s.treeState) 
            (newArethusa)
    } 


    static appendNewWordToSentence = (s: TextStateIO) => {
        const appendWord = s
            .currentSentenceId
            .fmap(
                ArethusaDoc.appendWordToSentence 
                    (ArethusaWord.createAttrs("---"))
            )

        const newArethusa = s
            .outputArethusaP
            .applyBind(appendWord)

        const getSentence = s
            .currentSentenceId
            .fmap(ArethusaDoc.sentenceById)

        const nextWordId = newArethusa
            .applyBind(getSentence)
            .bind(ArethusaSentence.lastTokenId)

        const newViewState = new ViewState (
            nextWordId, 
            s.currentSentenceId, 
            newArethusa
        )
    
        s.pushOutputArethusa 
            (false) 
            (newViewState) 
            (s.treeState) 
            (newArethusa)
    } 

    get outputArethusaP () {
        return TextStateIO.outputArethusa(this)
    }

    static outputArethusa = (s: TextStateIO): Maybe<ArethusaDoc> => {
        return s
            .currentState
            .bind(TextState.outputArethusaDeep)
    }

    static outputArethusaSentenceIds = 
        (tsio: TextStateIO) =>
    {
        const sentenceIds = tsio
            .outputArethusaP
            .fmap(ArethusaDoc.sentences)
            .unpackT([])
            .map(ArethusaSentence.id)

        
        const sentenceIdsNoNothings = Arr
            .removeNothings(sentenceIds)

        return sentenceIdsNoNothings
    }

    get outputArethusaSentenceIds() {
        return TextStateIO.outputArethusaSentenceIds(this)
    }

    get outputArethusaXML () {
        return this
            .outputArethusaP
            .bind(DXML.nodeXMLStr)
    }

    changeArethusaSentence = 
        (ext: boolean) => 
        (newS: ArethusaSentence) => 
    {
        TextStateIO.changeArethusaSentence (ext) (this) (newS) 
    }

    static changeArethusaSentence = 
        (ext: boolean) => 
        (s: TextStateIO) => 
        (newS: ArethusaSentence) => 
    {
        const newArethusa = s
            .outputArethusaP
            .bind(flip(ArethusaDoc.replaceSentence)(newS))

        // console.log('changeArethusaSentence', s.outputArethusaP.value?.node)
        // console.log('newArethusa', newArethusa.value?.node)

        s.pushOutputArethusa
            (ext)
            (new ViewState (
                    Nothing.of(), 
                    s.viewState.bind(ViewState.currentSentenceId), 
                    s.outputArethusaP
                )
            ) 
            (s.treeState)
            (newArethusa)       
    }

    changeView = 
        (wordId: Maybe<string>) => 
        (sentenceId: Maybe<string>) => 
    {
        TextStateIO.changeView(wordId)(sentenceId)(this)
    }

    /**
     * Fires, e.g. when the ArethusaDiv is clicked.
     * @param wordId 
     * @returns 
     */
    static changeView = 
        (wordId: Maybe<string>) => 
        (sentenceId: Maybe<string>) => 
        (s: TextStateIO) => 
    {
        // Create new ViewState
        const newVS = new ViewState(
            wordId, 
            sentenceId, 
            s.outputArethusaP
        )

        s.currentState.fmap(TextState.setViewState(newVS))

        s.show(false)
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
            .fmap(ArethusaDoc.sentenceById)

        const sent = textStateIO
            .outputArethusaP
            .applyBind(getSent)

        return sent
    }

    get currentSentenceId () {
        return this
            .viewState
            .bind(ViewState.currentSentenceId)
    }

    static currentSentenceId (tsio: TextStateIO) {
        return tsio.currentSentenceId
    }

    static setCurrentSentenceViewBoxStr = 
        (vb: string) => 
        (tsio: TextStateIO) => 
    {
        const sentId = tsio.currentSentenceId.unpackT("1")
        const setViewBox = SentenceViewState
            .setViewBoxBySentenceId(sentId)(vb)
        const x = tsio.currentState
            .bind(TextState.sentenceVS)
            .bind(setViewBox)
        
        // console.log(
        //     globalState
        //         .textStateIO
        //         .bind(TextStateIO.sentenceViewState)
        //         .fmap(SentenceViewState.viewstates)
        // )
        return x
    }

    get currentWord () {
        return TextStateIO.currentWord(this)
    }

    static currentWord = (s: TextStateIO) => {

        const getWord = s
            .currentTokenId
            .fmap(ArethusaDoc.wordById) 
        return s
            .outputArethusaP
            .applyBind(getWord)

    }

    get currentTokenId () {
        return TextStateIO.currentTokenId(this)
    }

    static currentTokenId = (s: TextStateIO) => {
        return s
            .viewState
            .bind(ViewState.currentTokenId)

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
            .bindErr("No formatted input Arethusa XML string.", ArethusaDoc.fromXMLStr)

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
                    .currentTokenId
                    .fmap(ArethusaDoc.wordById)
                
                return this
                    .outputArethusaP
                    .applyBind(getWord)
                    .bind(DXML.nodeXMLStr)
            }

            case (ViewType.Sentence): {
                const getSentence = this
                    .currentSentenceId
                    .fmap(ArethusaDoc.sentenceById)
                
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

    static inputArethusa = (s: TextStateIO): Maybe<ArethusaDoc> => {
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
            .applyBind(
                s.currentSentenceId.fmap(ArethusaDoc.insertSentenceBefore)
            )  

        s.pushOutputArethusa 
            (false)
            (new ViewState(s.currentTokenId, Nothing.of(), newArethusa)) 
            (s.treeState)
            (newArethusa)
    }

    get isLastState () {
        return MaybeT.comp 
            (this.currentStateIdx) 
            (Num.eq) 
            (this.lastStateIdx) 
    }

    get lastStateIdx() {
        return MaybeT.ofNonNeg(Arr.len(this.states) - 1)
    }

    moveTokenDown = () => {
        TextStateIO.moveTokenDown(this)
    }

    static moveTokenDown = (s: TextStateIO) => {
        s.moveToken (ArethusaSentence.moveTokenDown)
    }

    moveWordUp = () => {
        TextStateIO.moveTokenUp(this)
    }

    static moveTokenUp = (s: TextStateIO) => {
        s.moveToken (ArethusaSentence.moveTokenUp)
    }

    moveToken = 
        (moveFunc: 
            (id: string) => 
            (sentence: ArethusaSentence) => 
            Maybe<ArethusaDoc>
        ) => 
    {
        const moveToken = this
            .currentTokenId
            .fmap(moveFunc)

        const getSentence = this
            .currentSentenceId
            .fmap(ArethusaDoc.sentenceById)

        const sentence = this
            .currentState
            .bind(TextState.outputArethusaDeep)
            .applyBind(getSentence)

        const newArethusa = sentence
            .applyBind(moveToken)

        this.pushOutputArethusa 
            (false) 
            (new ViewState(
                this.currentTokenId, 
                this.currentSentenceId, 
                newArethusa)
            ) 
            (this.treeState) (newArethusa)

    }

    moveWordToNextSentence = () => {
        TextStateIO.moveTokenToNextSentence(this)
    }

    static moveTokenToNextSentence = (s: TextStateIO) => {
        const pushWordToNextSentence = s
            .currentTokenId
            .fmap(ArethusaDoc.moveTokenToNextSentence)
    
        const newArethusa = s
            .outputArethusaP
            .applyBind(pushWordToNextSentence) as Maybe<ArethusaDoc>
        
        s.pushOutputArethusa 
            (false) 
            (new ViewState(s.currentTokenId, Nothing.of(), newArethusa)) 
            (s.treeState) 
            (newArethusa)   
    }

    moveWordToPrevSentence = () => {
        TextStateIO.moveWordToPrevSentence(this)
    }

    static moveWordToPrevSentence = (s: TextStateIO) => {
        const pushWordToPrevSentence = s
            .currentTokenId
            .fmap(ArethusaDoc.moveTokenToPrevSentence)

        const newArethusa = s
            .outputArethusaP
            .applyBind(pushWordToPrevSentence)

        s.pushOutputArethusa 
            (false) 
            (new ViewState(s.currentTokenId, Nothing.of(), newArethusa)) 
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
        sentenceVS: Maybe<SentenceViewState>,
        treeState: Maybe<TreeState>,
        inputPlainText: Maybe<string>,
        inputArethusa: Maybe<ArethusaDoc>,
        outputArethusa: Maybe<ArethusaDoc>,
        epidoc: Maybe<EpiDoc>
    ) => 
    {
        const s = TextState.of(
            viewState.fmap(ViewState.deepcopy),
            sentenceVS.fmap(SentenceViewState.deepcopy),
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

    get prevState() {
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

    pushInputArethusa = (arethusa: Maybe<ArethusaDoc>) => {
        TextStateIO.pushInputArethusa(arethusa)(this)
    }

    static pushInputArethusa = (arethusa: Maybe<ArethusaDoc>) => 
        (s: TextStateIO) => {
        s.appendNewState(false) (TextState.of(
            s.viewState,
            s.currentState
                .bind(TextState.sentenceVSDeep),
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
        (outputArethusa: Maybe<ArethusaDoc>) =>
    {
        this.appendNewState 
            (ext) 
            (TextState.of(
                MaybeT.of(viewState),
                this.currentState
                    .bind(TextState.sentenceVS),
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
                s.currentState
                    .bind(TextState.sentenceVSDeep),
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
                s.currentState
                    .bind(TextState.sentenceVSDeep),
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
            .fmap(ArethusaDoc.removeSentenceById)

        const newArethusa = s
            .outputArethusaP
            .applyBind(removeSentence)

        s.pushOutputArethusa 
            (false)
            (new ViewState(Nothing.of(), Nothing.of(), newArethusa)) 
            (s.treeState)
            (newArethusa)
    }

    removeArethusaToken = () => {
        TextStateIO.removeArethusaToken(this)
    }

    static removeArethusaToken = (s: TextStateIO) => {
        const removeWord = s
            .currentSentenceId
            .applyFmap(
                s.currentTokenId
                    .fmap(ArethusaDoc.removeTokenByTokenAndSentenceId)
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

    get sentenceViewState () {
        return TextStateIO.sentenceViewState(this)
    }

    static sentenceViewState = (tsio: TextStateIO) => {
        return tsio.currentState.bind(TextState.sentenceVS)
    }

    static setSentenceViewState = (tsio: TextStateIO) => {
        tsio.currentState
    }

    static initSentenceViewState = (tsio: TextStateIO) => {
        const ts = TextStateIO.currentState(tsio)

        const sentenceIds = ts
            .fmap(TextState.outputArethusaSentenceIds)
            .unpackT([])

        // console.log("calling new sentence view state")

        if (ts.bind(TextState.sentenceVS).isNothing) {
            if (sentenceIds.length > 0) {
                // console.log("new sentence view state")
                // if (tsio.currentStateIdx.unpackT(0) > 0) {
                //     console.log("copying")
                //     const x = ts.fmap(TextState
                //         .setSentenceVS(
                //             tsio.prevState.bind(TextState.sentenceVSDeep)
                //         ))
                // }
                // else {
                    ts.fmap(TextState
                        .setSentenceVS(
                            MaybeT.of(new SentenceViewState(sentenceIds))
                        )   
                    )
                // }
            }
        }
    }

    static updateSentenceViewState = (tsio: TextStateIO) => {
        TextStateIO.initSentenceViewState(tsio)

        TextStateIO.currentState(tsio)
            .bind(TextState.sentenceVS)
            .fmap(SentenceViewState.updateFromTSIO(tsio))
    }

    updateSentenceViewState = () => {
        TextStateIO
            .updateSentenceViewState(this)
    }

    splitSentenceAtCurrentWord = () => {
        return TextStateIO.splitSentenceAtCurrentWord(this)
    }

    static splitSentenceAtCurrentWord = (s: TextStateIO) => {
        const splitAtWord = s
            .currentTokenId
            .fmap(ArethusaDoc.splitSentenceAt)

        const newArethusa = s
            .outputArethusaP
            .applyBind(splitAtWord)

        s.pushOutputArethusa 
            (false)
            (new ViewState(s.currentTokenId, Nothing.of(), newArethusa)) 
            (s.treeState)
            (newArethusa)
    }


    /**
     * Representation of all the sentences in a string
     */

    get sentencesRep () {

        const sentences = this
            .outputArethusaP
            .fmap(ArethusaDoc.sentences)
            .unpackT([])

        const sentenceStrs = sentences
            .map( (s: ArethusaSentence) => {
                const words = ArethusaSentence
                    .words(s)
                    .map(ArethusaToken.form)
                    .reduce(Arr.removeNothingReduce, [] as string[])
                    
                return words.join(" ")
            })

        return sentenceStrs
            .join(". ")
            .concat(".")
    }

    private show = (ext: boolean) => {
        EpiDoc.pushToFrontend(this)
        ArethusaDoc.pushToFrontend(this)
        Frontend.pushPlainTextToFrontend(this)
        this.updateSentenceViewState()

        // Set the sentences text
        let v = this.currentSentence.fmap(ArethusaSentence.wordsAsStr).fmap(SentencesDiv.setText)
        // console.log(this.currentSentence)
        // if (v != undefined) {
        //     SentencesDiv.setText(v)
        // }
        // SentencesDiv.setText(this.currentSentence.value?.text?.value)

        // Update the tree
        const treeStateFunc = MaybeT.of(globalState.simulation).isNothing ? 
            ArethusaSentence.toTreeSentState :
            ArethusaSentence.toTreeSentStateWithNodesFromExistingTree
                (globalState.simulation.nodes())

        const treeState = this.currentSentence.isNothing ? 
            MaybeT.of(TreeState.of
                    (0) 
                    ("1") 
                    ([]) 
                    ([]) 
                    (ClickState.none())
            ) :
            this.currentSentence.bind(treeStateFunc)

        // Convert wordId to treeNodeId
        const getTreeNodeId = this
            .currentTokenId
            .fmap(Str.toNum)
            .fmap(TreeState.tokenIdToTreeNodeId)

        const treeNodeId = treeState
            .applyBind(getTreeNodeId)
            .fmap(Str.fromNum)

        const clickState = ClickState
            .of
                (treeNodeId)
                (TreeLabelType.NodeLabel)
                (ClickType.Left)

        treeState.fmap(TreeState.setClickState(clickState))
    
        // Change the tree
        if (!ext) {
            globalState
                .treeStateIO
                .applyFmap(
                    treeState
                        .fmapErr("No tree state", TreeStateIO.push(true)(!ext))
                )

            this.currentState
                .fmap(TextState.updateTreeState(treeState))
        }

        // Set the viewbox
        this.sentenceViewState
            .fmap(SentenceViewState.updateSVGViewBox(this.currentSentenceId.unpackT("")))
    }    

    get states() {
        return this._textStates
    }

    get treeState() {
        return this.currentState.bind(TextState.treeStateDeep)
    }

    undo = () => {
        TextStateIO.undo(this)
    }

    static undo = (s: TextStateIO) => {
        s.currentStateIdx = s.prevIdx
        s.show(false)
    }

    get viewState() {
        return this.currentState.bind(TextState.viewState)
    }

}

