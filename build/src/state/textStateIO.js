class TextStateIO {
    appendNewSentenceToArethusa() {
        TextStateIO.appendNewSentenceToArethusa(this);
    }
    appendNewWordToSentence() {
        TextStateIO.appendNewWordToSentence(this);
    }
    get outputArethusaP() {
        return TextStateIO.outputArethusa(this);
    }
    get outputArethusaXML() {
        return this
            .outputArethusaP
            .bind(DXML.nodeXMLStr);
    }
    constructor(initialState) {
        this._textStates = [];
        this._currentStateIdx = Nothing.of();
        this.appendNewState = (ext) => (state) => {
            const s = MaybeT.of(state);
            const newState = TextState.maybeOf(s.bind(TextState.viewStateDeep), s.bind(TextState.treeStateDeep), s.bind(TextState.plainText), s.bind(TextState.inputArethusaDeep), s.bind(TextState.outputArethusaDeep), s.bind(TextState.epidocDeep));
            if (!newState.fmap(TextState.hasNothing).unpackT(true)) {
                newState.fmap(this.push);
                this.currentStateIdx = this.lastStateIdx;
            }
            this.show(ext);
        };
        this.changeArethusaSentence = (ext) => (newS) => {
            TextStateIO.changeArethusaSentence(ext)(this)(newS);
        };
        this.changeView = (wordId) => (sentenceId) => {
            TextStateIO.changeView(wordId)(sentenceId)(this);
        };
        this.redo = () => {
            TextStateIO.redo(this);
        };
        this.formatInputArethusa = () => {
            TextStateIO.formatInputArethusa(this);
        };
        this.formatInputEpiDoc = () => {
            TextStateIO.formatInputEpiDoc(this);
        };
        this.insertSentence = () => {
            return TextStateIO.insertSentence(this);
        };
        this.moveWordDown = () => {
            TextStateIO.moveWordDown(this);
        };
        this.moveWordUp = () => {
            TextStateIO.moveWordUp(this);
        };
        this.moveWord = (moveFunc) => {
            const moveWord = this
                .currentWordId
                .fmap(moveFunc);
            const getSentence = this
                .currentSentenceId
                .fmap(ArethusaDoc.sentenceById);
            const sentence = this
                .currentState
                .bind(TextState.outputArethusaDeep)
                .applyBind(getSentence);
            const newArethusa = sentence
                .applyBind(moveWord);
            this.pushOutputArethusa(false)(new ViewState(this.currentWordId, this.currentSentenceId, newArethusa))(this.treeState)(newArethusa);
        };
        this.moveWordToNextSentence = () => {
            TextStateIO.moveWordToNextSentence(this);
        };
        this.moveWordToPrevSentence = () => {
            TextStateIO.moveWordToPrevSentence(this);
        };
        this.nextState = () => {
            const f = flip(Arr.byIdx);
            return this
                .nextIdx
                .bind(f(this.states));
        };
        this.prevState = () => {
            const f = flip(Arr.byIdx);
            return this
                .prevIdx
                .bind(f(this.states));
        };
        this.push = (s) => {
            if (!this.isLastState)
                this.removePostStates();
            this._textStates = Arr.push(s)(this._textStates);
            this._currentStateIdx = MaybeT.ofNonNeg(Arr.len(this._textStates) - 1);
        };
        this.pushInputArethusa = (arethusa) => {
            TextStateIO.pushInputArethusa(arethusa)(this);
        };
        this.pushOutputArethusa = (ext) => (viewState) => (treeState) => (outputArethusa) => {
            this.appendNewState(ext)(TextState.of(MaybeT.of(viewState), treeState, this.currentState
                .bind(TextState.plainText), this.currentState
                .bind(TextState.inputArethusaDeep), outputArethusa, this.currentState
                .bind(TextState.epidocDeep)));
        };
        this.pushEpiDoc = (epidoc) => {
            TextStateIO.pushEpiDoc(epidoc)(this);
        };
        this.pushPlainText = (plainText) => {
            TextStateIO.pushPlainText(plainText)(this);
        };
        this.removePostStates = () => {
            const getSlice = this
                .currentStateIdx
                .fmap(Num.add(1))
                .fmap(Arr.slice(0));
            this._textStates = MaybeT.of(this._textStates)
                .applyFmap(getSlice)
                .unpackT([]);
        };
        this.removeSentence = () => {
            TextStateIO.removeSentence(this);
        };
        this.removeArethusaWord = () => {
            TextStateIO.removeArethusaWord(this);
        };
        this.splitSentenceAtCurrentWord = () => {
            return TextStateIO.splitSentenceAtCurrentWord(this);
        };
        this.undo = () => {
            TextStateIO.undo(this);
        };
        this.show = (ext) => {
            EpiDoc.pushToFrontend(this);
            ArethusaDoc.pushToFrontend(this);
            Frontend.pushPlainTextToFrontend(this);
            SentencesDiv.setText(this.sentencesRep);
            // Update tree state
            const treeStateFunc = MaybeT.of(globalState.simulation).isNothing ?
                ArethusaSentence.toTreeSentState :
                ArethusaSentence.toTreeSentStateWithNodesFromExistingTree(globalState.simulation.nodes());
            const treeState = this.currentSentence.isNothing ?
                MaybeT.of(TreeState.of(0)("1")([])([])(ClickState.none())) :
                this.currentSentence.bind(treeStateFunc);
            // Convert wordId to treeNodeId
            const getTreeNodeId = this
                .currentWordId
                .fmap(Str.toNum)
                .fmap(TreeState.tokenIdToTreeNodeId);
            const treeNodeId = treeState.applyBind(getTreeNodeId)
                .fmap(Str.fromNum);
            const clickState = ClickState.of(treeNodeId)(ElementType.NodeLabel)(ClickType.Left);
            treeState.fmap(TreeState.setClickState(clickState));
            if (!ext) {
                globalState
                    .treeStateIO
                    .applyFmap(treeState
                    .fmapErr("No tree state", TreeStateIO.push(true)(!ext)));
                this.currentState
                    .fmap(TextState.updateTreeState(treeState));
            }
        };
        this.appendNewState(false)(initialState);
    }
    get currentState() {
        return TextStateIO.currentState(this);
    }
    get currentStateIdx() {
        return this._currentStateIdx;
    }
    set currentStateIdx(value) {
        const createBoundedNum = this
            .lastStateIdx
            .fmap(BoundedNum.of(0));
        this._currentStateIdx = value
            .applyFmap(createBoundedNum)
            .fmap(BoundedNum.value);
    }
    get currentSentence() {
        return TextStateIO.currentSentence(this);
    }
    get currentSentenceId() {
        return this
            .viewState
            .bind(ViewState.currentSentenceId);
    }
    get currentWord() {
        return TextStateIO.currentWord(this);
    }
    get currentWordId() {
        return TextStateIO.currentWordId(this);
    }
    get epidoc() {
        return this
            .currentState
            .bind(TextState.epidocDeep);
    }
    epidocToArethusa() {
        TextStateIO.epidocToArethusa(this);
    }
    get epidocXML() {
        return this
            .epidoc
            .fmap(EpiDoc.toXMLStr);
    }
    get highlightedNodeStr() {
        switch (this
            .viewState
            .fmap(ViewState.viewType)
            .unpackT(ViewType.Unknown)) {
            case (ViewType.Word): {
                const getWord = this
                    .currentWordId
                    .fmap(ArethusaDoc.wordById);
                return this
                    .outputArethusaP
                    .applyBind(getWord)
                    .bind(DXML.nodeXMLStr);
            }
            case (ViewType.Sentence): {
                const getSentence = this
                    .currentSentenceId
                    .fmap(ArethusaDoc.sentenceById);
                return this
                    .outputArethusaP
                    .applyBind(getSentence)
                    .bind(DXML.nodeXMLStr);
            }
            default: {
                return Nothing.of();
            }
        }
    }
    get inputArethusaP() {
        return TextStateIO.inputArethusa(this);
    }
    get inputArethusaXML() {
        return this
            .inputArethusaP
            .bind(DXML.nodeXMLStr);
    }
    get isLastState() {
        return MaybeT.comp(this.currentStateIdx)(Num.eq)(this.lastStateIdx);
    }
    get nextIdx() {
        return $$(MaybeT.of)(this
            .currentStateIdx
            .applyFmap(this.lastStateIdx.fmap(BoundedNum.of(0)))
            .fmap(BoundedNum.increment)
            .fmap(BoundedNum.value)
            .unpack(1));
    }
    get prevIdx() {
        return this
            .currentStateIdx
            .applyFmap(this.lastStateIdx.fmap(BoundedNum.of(0)))
            .fmap(BoundedNum.decrement)
            .fmap(BoundedNum.value);
    }
    /**
     * Representation of all the sentences in a string
     */
    get sentencesRep() {
        const sentences = this
            .outputArethusaP
            .fmap(ArethusaDoc.sentences)
            .unpackT([]);
        const sentenceStrs = sentences
            .map((s) => {
            const words = ArethusaSentence
                .words(s)
                .map(ArethusaToken.form)
                .reduce(Arr.removeNothingReduce, []);
            return words.join(" ");
        });
        return sentenceStrs
            .join(". ")
            .concat(".");
    }
    get lastStateIdx() {
        return MaybeT.ofNonNeg(Arr.len(this.states) - 1);
    }
    get states() {
        return this._textStates;
    }
    get treeState() {
        return this.currentState.bind(TextState.treeStateDeep);
    }
    get viewState() {
        return this.currentState.bind(TextState.viewState);
    }
}
TextStateIO.appendNewSentenceToArethusa = (s) => {
    const maybeS = MaybeT.of(s);
    const newSentenceId = maybeS
        .bind(TextStateIO.outputArethusa)
        .fmap(ArethusaDoc.newNextSentenceId);
    s.pushOutputArethusa(false)(new ViewState(Nothing.of(), newSentenceId, s.outputArethusaP))(s.treeState)(maybeS
        .bind(TextStateIO.outputArethusa)
        .bind(ArethusaDoc.appendSentence));
};
TextStateIO.appendNewState = (ext) => (state) => (tsio) => {
    const s = MaybeT.of(state);
    const newState = TextState.maybeOf(s.bindErr("Error.", TextState.viewStateDeep), s.bindErr("Error.", TextState.treeStateDeep), s.bindErr("Error.", TextState.plainText), s.bindErr("Error.", TextState.inputArethusaDeep), s.bindErr("Error.", TextState.outputArethusaDeep), s.bindErr("Error.", TextState.epidocDeep));
    // if (!newState.fmap(TextState.hasNothing).unpackT(true)) {
    newState.fmap(tsio.push);
    tsio.currentStateIdx = tsio.lastStateIdx;
    // }
    tsio.show(ext);
    return 0;
};
TextStateIO.appendNewArtificialToSentence = (s) => {
    const appendArtificial = s
        .currentSentenceId
        .fmap(ArethusaDoc.appendArtificialToSentence(ArethusaArtificial.createAttrs("0")));
    const newArethusa = s
        .outputArethusaP
        .applyBind(appendArtificial);
    const getSentence = s
        .currentSentenceId
        .fmap(ArethusaDoc.sentenceById);
    const nextTokenId = newArethusa
        .applyBind(getSentence)
        .bind(ArethusaSentence.lastTokenId);
    const newViewState = new ViewState(nextTokenId, s.currentSentenceId, newArethusa);
    s.pushOutputArethusa(false)(newViewState)(s.treeState)(newArethusa);
};
TextStateIO.appendNewWordToSentence = (s) => {
    const appendWord = s
        .currentSentenceId
        .fmap(ArethusaDoc.appendWordToSentence(ArethusaWord.createAttrs("---")));
    const newArethusa = s
        .outputArethusaP
        .applyBind(appendWord);
    const getSentence = s
        .currentSentenceId
        .fmap(ArethusaDoc.sentenceById);
    const nextWordId = newArethusa
        .applyBind(getSentence)
        .bind(ArethusaSentence.lastTokenId);
    const newViewState = new ViewState(nextWordId, s.currentSentenceId, newArethusa);
    s.pushOutputArethusa(false)(newViewState)(s.treeState)(newArethusa);
};
TextStateIO.outputArethusa = (s) => {
    return s
        .currentState
        .bind(TextState.outputArethusaDeep);
};
TextStateIO.changeArethusaSentence = (ext) => (s) => (newS) => {
    const newArethusa = s
        .outputArethusaP
        .bind(flip(ArethusaDoc.replaceSentence)(newS));
    s.pushOutputArethusa(ext)(new ViewState(Nothing.of(), s.viewState.bind(ViewState.currentSentenceId), s.outputArethusaP))(s.treeState)(newArethusa);
};
TextStateIO.changeView = (wordId) => (sentenceId) => (s) => {
    const newVS = MaybeT.of(new ViewState(wordId, sentenceId, s.outputArethusaP));
    s.currentState
        .applyFmap(newVS.fmap(TextState.setViewState));
    s.show(false);
};
TextStateIO.currentState = (s) => {
    return MaybeT.of(s.states[s.currentStateIdx.unpackT(-1)]);
};
TextStateIO.currentSentence = (textStateIO) => {
    const getSent = textStateIO
        .currentSentenceId
        .fmap(ArethusaDoc.sentenceById);
    const sent = textStateIO
        .outputArethusaP
        .applyBind(getSent);
    if (sent.isNothing) {
        return textStateIO
            .outputArethusaP
            .bind(ArethusaDoc.lastSentence);
    }
    return sent;
};
TextStateIO.currentWord = (s) => {
    const getWord = s
        .currentWordId
        .fmap(ArethusaDoc.wordById);
    return s
        .outputArethusaP
        .applyBind(getWord);
};
TextStateIO.currentWordId = (s) => {
    return s
        .viewState
        .bind(ViewState.currentWordId);
};
TextStateIO.epidocToArethusa = (s) => {
    s.pushEpiDoc(Frontend.epidoc);
    const newArethusa = s
        .epidoc
        .bind(Conversion.epidocToArethusa);
    s.pushOutputArethusa(false)(new ViewState(Nothing.of(), Nothing.of(), newArethusa))(Nothing.of())(newArethusa);
};
TextStateIO.redo = (textStateIO) => {
    textStateIO.currentStateIdx = textStateIO.nextIdx;
    textStateIO.show(false);
};
TextStateIO.formatInputArethusa = (s) => {
    s.pushInputArethusa(Frontend.inputArethusa);
    const formattedXML = s
        .inputArethusaXML
        .fmapErr("No input Arethusa XML", XML.fromXMLStr)
        .fmapErr("No input Arethusa XML string", XMLFormatter.prettifyFromRoot(true))
        .fmapErr("No prettified input Arethusa XML string", XML.toStr);
    const newInputArethusa = formattedXML
        .bindErr("No formatted input Arethusa XML string.", ArethusaDoc.fromXMLStr);
    s.pushInputArethusa(newInputArethusa);
};
TextStateIO.formatInputEpiDoc = (s) => {
    s.pushEpiDoc(Frontend.epidoc);
    const formattedXML = s
        .epidocXML
        .fmapErr("No EpiDoc XML", XML.fromXMLStr)
        .fmapErr("No EpiDoc XML string", XMLFormatter.prettifyFromRoot(true))
        .fmapErr("No prettified EpiDoc XML string", XML.toStr);
    const newEpiDoc = formattedXML
        .bindErr("No formatted EpiDoc XML string.", EpiDoc.fromXMLStr);
    s.pushEpiDoc(newEpiDoc);
};
TextStateIO.inputArethusa = (s) => {
    return s
        .currentState
        .bind(TextState.inputArethusaDeep);
};
TextStateIO.insertSentence = (s) => {
    const newArethusa = s
        .outputArethusaP
        .applyBind(s.currentSentenceId.fmap(ArethusaDoc.insertSentenceBefore));
    s.pushOutputArethusa(false)(new ViewState(s.currentWordId, Nothing.of(), newArethusa))(s.treeState)(newArethusa);
};
TextStateIO.moveWordDown = (s) => {
    s.moveWord(ArethusaSentence.moveWordDown);
};
TextStateIO.moveWordUp = (s) => {
    s.moveWord(ArethusaSentence.moveWordUp);
};
TextStateIO.moveWordToNextSentence = (s) => {
    const pushWordToNextSentence = s
        .currentWordId
        .fmap(ArethusaDoc.moveWordToNextSentence);
    const newArethusa = s
        .outputArethusaP
        .applyBind(pushWordToNextSentence);
    s.pushOutputArethusa(false)(new ViewState(s.currentWordId, Nothing.of(), newArethusa))(s.treeState)(newArethusa);
};
TextStateIO.moveWordToPrevSentence = (s) => {
    const pushWordToPrevSentence = s
        .currentWordId
        .fmap(ArethusaDoc.moveWordToPrevSentence);
    const newArethusa = s
        .outputArethusaP
        .applyBind(pushWordToPrevSentence);
    s.pushOutputArethusa(false)(new ViewState(s.currentWordId, Nothing.of(), newArethusa))(s.treeState)(newArethusa);
};
TextStateIO.of = (viewState, treeState, inputPlainText, inputArethusa, outputArethusa, epidoc) => {
    const s = TextState.of(viewState.fmap(ViewState.deepcopy), treeState.fmap(TreeState.deepcopy), inputPlainText, inputArethusa, outputArethusa, epidoc);
    return new TextStateIO(s);
};
TextStateIO.pushInputArethusa = (arethusa) => (s) => {
    s.appendNewState(false)(TextState.of(s.viewState, s.treeState, s.currentState.bind(TextState.plainText), arethusa, arethusa, s.currentState.bind(TextState.epidocDeep)));
};
TextStateIO.pushEpiDoc = (epidoc) => (s) => {
    s.appendNewState(false)(TextState.of(s.viewState, s.treeState, s.currentState.bind(TextState.plainText), s.currentState.bind(TextState.inputArethusaDeep), s.currentState.bind(TextState.outputArethusaDeep), epidoc));
};
TextStateIO.pushPlainText = (plainText) => (s) => {
    s.appendNewState(false)(TextState.of(s.viewState, s.treeState, plainText, s.currentState.bind(TextState.inputArethusaDeep), s.currentState.bind(TextState.outputArethusaDeep), s.currentState.bind(TextState.epidocDeep)));
};
TextStateIO.removeSentence = (s) => {
    const removeSentence = s
        .currentSentenceId
        .fmap(ArethusaDoc.removeSentenceById);
    const newArethusa = s
        .outputArethusaP
        .applyBind(removeSentence);
    s.pushOutputArethusa(false)(new ViewState(Nothing.of(), Nothing.of(), newArethusa))(s.treeState)(newArethusa);
};
TextStateIO.removeArethusaWord = (s) => {
    const removeWord = s
        .currentSentenceId
        .applyFmap(s.currentWordId
        .fmap(ArethusaDoc.removeWordByWordAndSentenceId));
    const newArethusa = s
        .outputArethusaP
        .applyBind(removeWord);
    s.pushOutputArethusa(false)(new ViewState(Nothing.of(), Nothing.of(), newArethusa))(s.treeState)(newArethusa);
};
TextStateIO.splitSentenceAtCurrentWord = (s) => {
    const splitAtWord = s
        .currentWordId
        .fmap(ArethusaDoc.splitSentenceAt);
    const newArethusa = s
        .outputArethusaP
        .applyBind(splitAtWord);
    s.pushOutputArethusa(false)(new ViewState(s.currentWordId, Nothing.of(), newArethusa))(s.treeState)(newArethusa);
};
TextStateIO.undo = (s) => {
    s.currentStateIdx = s.prevIdx;
    s.show(false);
};
