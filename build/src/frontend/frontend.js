class Frontend {
    static get addNewArtificialBtn() {
        return Frontend.buttonById("AddNewArtificial");
    }
    static get addNewWordBtn() {
        return Frontend.buttonById("AddNewWord");
    }
    static get arethusaOutputDiv() {
        return ArethusaDiv.control;
    }
    static get arethusaInputTextArea() {
        return HTML.q("textarea#dstXML");
    }
    static get inputArethusaXML() {
        return Frontend
            .arethusaInputTextArea
            .fmap(HTML.value);
    }
    static get inputPlainText() {
        return HTML.q("sentence-text input");
    }
    static get inputArethusa() {
        return Frontend.inputArethusaXML
            .bind(ArethusaDoc.fromXMLStr);
    }
    static get appendNewSentenceToArethusaBtn() {
        return Frontend.buttonById("AddNewSentence");
    }
    static get arethusaExampleBtn() {
        return Frontend.buttonById("ExampleArethusa");
    }
    static get arethusaOutputToolbar() {
        return HTML.q("div.arethusa.output.toolbar");
    }
    static get arethusaOutputShowBtn() {
        return Frontend.buttonById("ToggleShowOutputArethusa");
    }
    static get arethusaInputShowBtn() {
        return Frontend.buttonById("ToggleShowInputArethusa");
    }
    static get arethusaInputToolbar() {
        return HTML.q("div.arethusa.input.toolbar");
    }
    static buttonById(htmlId) {
        const msg = `No button with id ${htmlId}.`;
        return HTML.qThrow(msg, `button#${htmlId}`);
    }
    static buttonByQ(query) {
        const msg = `No div with class button.${query}.`;
        return HTML.qThrow(msg, `button.${query}`);
    }
    static divById(htmlId) {
        const msg = `No div with id ${htmlId}.`;
        return HTML.qThrow(msg, `div#${htmlId}`);
    }
    static divByQ(query) {
        const msg = `No div with class div.${query}.`;
        return HTML.qThrow(msg, `div.${query}`);
    }
    static get epidocExampleBtn() {
        return Frontend.buttonById("ExampleEpiDoc");
    }
    static get epidocInputTextArea() {
        return HTML.q("textarea#srcXML");
    }
    static get epidocInputToolbar() {
        return HTML.q("div.epidoc.input.toolbar");
    }
    static get epidocInputShowBtn() {
        return Frontend.buttonById("ToggleShowInputEpiDoc");
    }
    static get epidocXML() {
        return Frontend
            .epidocInputTextArea
            .fmapErr("No EpiDoc input text area.", HTML.value);
    }
    static get epidoc() {
        return Frontend.epidocXML
            .bindErr("No epidoc XMl", EpiDoc.fromXMLStr);
    }
    static get plainText() {
        return Frontend
            .inputPlainText
            .fmap(TextArea.value);
    }
    static formatInputEpiDoc = () => {
        try {
            Frontend
                .epidocInputTextArea
                .fmap(TextArea.value)
                .fmap(Frontend.processEpiDoc);
            globalState
                .textStateIO
                .fmapErr("No textStateIO", TextStateIO.formatInputEpiDoc);
        }
        catch (e) {
            const outputArethusaDiv = ArethusaDiv.control._value;
            if (outputArethusaDiv == null) {
                throw new Error("No output Arethusa <div> element");
            }
            if (e instanceof XMLParseError) {
                outputArethusaDiv.replaceChildren(e.message);
            }
            else if (e instanceof ValidationError) {
                outputArethusaDiv.replaceChildren(e.message);
            }
            else {
                throw e;
            }
        }
    };
    static formatInputArethusa = () => {
        try {
            Frontend
                .arethusaInputTextArea
                .fmap(TextArea.value)
                .fmap(Frontend.processArethusa);
            globalState
                .textStateIO
                .fmapErr("No textStateIO", TextStateIO.formatInputArethusa);
        }
        catch (e) {
            const outputArethusaDiv = ArethusaDiv.control._value;
            if (outputArethusaDiv == null) {
                throw new Error("No output Arethusa <div> element");
            }
            if (e instanceof XMLParseError) {
                outputArethusaDiv.replaceChildren(e.message);
            }
            else if (e instanceof ValidationError) {
                outputArethusaDiv.replaceChildren(e.message);
            }
            else {
                throw e;
            }
        }
    };
    /**
     * Saves the current state; if an error, e.g. if
     * an XML document is empty, does not save
     */
    static saveCurrentState = () => {
        // if (Frontend.epidocInputTextArea.value != null)
        //     Frontend.epidocInputTextArea.value.textContent = ""
        // if (Frontend.arethusaInputTextArea.value != null)
        //     Frontend.arethusaInputTextArea.value.textContent = ""
        try {
            if (globalState.textStateIO.isNothing) {
                globalState.createTextStateIO(Nothing.of(), Nothing.of(), Nothing.of());
            }
            const textState = TextState.of(globalState
                .textStateIO
                .bind(TextStateIO.currentState)
                .bind(TextState.viewState), globalState
                .textStateIO
                .bind(TextStateIO.currentState)
                .bind(TextState.sentenceVSDeep), Nothing.of(), Frontend.plainText, Frontend.inputArethusa, globalState
                .textStateIO
                .bind(TextStateIO.currentState)
                .bind(TextState.outputArethusaDeep), Frontend.epidoc);
            globalState
                .textStateIO
                .fmapErr("No textStateIO", TextStateIO.appendNewState(false)(textState));
        }
        catch (e) {
            if (e instanceof XMLParseError) {
                return;
            }
        }
    };
    static processEpiDoc = (epidocStr) => {
        Frontend.saveCurrentState();
        try {
            const epidoc = EpiDoc.fromXMLStr_(epidocStr);
            TEIValidator.assertValid(epidoc);
            const arethusa = MaybeT
                .of(epidocStr)
                .bind(Conversion.epidocXMLToArethusa);
            arethusa.fmap(ArethusaValidator.assertValid);
            const textState = TextState.of(arethusa.fmap(ViewState.of("1")("1")), Nothing.of(), Nothing.of(), Nothing.of(), arethusa, arethusa, MaybeT.of(epidoc));
            globalState
                .textStateIO
                .fmapErr("No textStateIO", TextStateIO.appendNewState(false)(textState));
            globalState.createTreeStateIO();
            globalState.graph();
        }
        catch (error) {
            const outputArethusaDiv = ArethusaDiv.control._value;
            if (outputArethusaDiv == null) {
                throw new Error("No output Arethusa <div> element");
            }
            if (error instanceof XMLParseError) {
                outputArethusaDiv.replaceChildren(error.message);
            }
            else if (error instanceof ValidationError) {
                outputArethusaDiv.replaceChildren(error.message);
            }
            else if (error instanceof TokenCountError) {
                outputArethusaDiv.replaceChildren(error.message);
            }
            else {
                throw error;
            }
        }
    };
    static processArethusa = (arethusaStr) => {
        Frontend.saveCurrentState();
        try {
            const arethusa = ArethusaDoc.fromXMLStr_(arethusaStr);
            ArethusaValidator.assertValid(arethusa);
            const renumbered = MaybeT.of(arethusa)
                .bind(ArethusaDoc.renumberTokenIds(true));
            const textstate = TextState.of(renumbered.fmap(ViewState.of("1")("1")), Nothing.of(), Nothing.of(), Nothing.of(), MaybeT.of(arethusa), MaybeT.of(arethusa), Nothing.of());
            globalState
                .textStateIO
                .fmapErr("No textStateIO", TextStateIO.appendNewState(false)(textstate));
            globalState.createTreeStateIO();
            globalState.graph();
        }
        catch (error) {
            const outputArethusaDiv = ArethusaDiv.control._value;
            if (outputArethusaDiv == null) {
                throw new Error("No output Arethusa <div> element");
            }
            if (error instanceof XMLParseError) {
                outputArethusaDiv.replaceChildren(error.message);
            }
            else if (error instanceof ValidationError) {
                outputArethusaDiv.replaceChildren(error.message);
            }
            else if (error instanceof TokenCountError) {
                outputArethusaDiv.replaceChildren(error.message);
            }
            else {
                throw error;
            }
        }
    };
    static processText = (textStr) => {
        if (textStr === "") {
            return;
        }
        try {
            Frontend.saveCurrentState();
            const arethusa = MaybeT
                .of(textStr)
                .bind(ArethusaDoc.fromPlainTextStr);
            const textstate = TextState.of(arethusa.fmap(ViewState.of("1")("1")), Nothing.of(), Nothing.of(), MaybeT.of(textStr), arethusa, arethusa, Nothing.of());
            globalState
                .textStateIO
                .fmapErr("No textStateIO", TextStateIO.appendNewState(false)(textstate));
            globalState.createTreeStateIO();
            globalState.graph();
        }
        catch (error) {
            const outputArethusaDiv = ArethusaDiv.control._value;
            if (outputArethusaDiv == null) {
                throw new Error("No output Arethusa <div> element");
            }
            if (error instanceof XMLParseError) {
                outputArethusaDiv.replaceChildren(error.message);
            }
            else if (error instanceof TokenCountError) {
                outputArethusaDiv.replaceChildren(error.message);
            }
            else {
                throw error;
            }
        }
    };
    static pushPlainTextToFrontend = (textStateIO) => {
        const plainText = textStateIO
            .currentState
            .bind(TextState.plainText);
        if (plainText.isNothing) {
            Frontend
                .textInputTextArea
                .applyFmap(MaybeT.of("").fmap(Frontend.updateTextArea));
            return;
        }
        Frontend
            .textInputTextArea
            .applyBind(plainText.fmap(Frontend.updateTextArea));
    };
    static get insertSentenceBtn() {
        return Frontend.buttonById("InsertSentence");
    }
    static get inputShowBtn() {
        return Frontend.buttonById("ToggleShowInput");
    }
    static get leftBoundaryDiv() {
        return HTML.q("div.left.boundary");
    }
    static get loadArethusaBtn() {
        return Frontend.buttonById("loadFile");
    }
    static get loadTextBtn() {
        return Frontend.buttonById("loadTextFile");
    }
    static get moveWordToNextSentenceBtn() {
        return Frontend.buttonById("PushToNextSentence");
    }
    static get moveWordToPrevSentenceBtn() {
        return Frontend.buttonById("PushToPreviousSentence");
    }
    static get moveUpBtn() {
        return Frontend.buttonById("MoveUp");
    }
    static get moveDownBtn() {
        return Frontend.buttonById("MoveDown");
    }
    static get nextSentenceBtn() {
        return Frontend.buttonById("NextSentence");
    }
    static get prevSentenceBtn() {
        return Frontend.buttonById("PrevSentence");
    }
    static get redoBtn() {
        return Frontend.buttonById("RedoTextEdit");
    }
    static get pushToNextSentenceBtn() {
        return Frontend.buttonById("PushToNextSentence");
    }
    static get pushToPrevSentenceBtn() {
        return Frontend.buttonById("PushToPreviousSentence");
    }
    static get removeSentenceBtn() {
        return Frontend.buttonById("RemoveSentence");
    }
    static get removeWordBtn() {
        return Frontend.buttonById("RemoveWord");
    }
    static get sentencesDiv() {
        return MaybeT.of(document.getElementById("sentencesDiv"));
    }
    static downloadArethusa = () => {
        const arethusa = globalState
            .textStateIO
            .bind(TextStateIO.currentState)
            .bind(TextState.outputArethusaDeep);
        const docId = arethusa
            .bind(ArethusaDoc.docId)
            .fromMaybe("tree");
        arethusa
            .fmap(ArethusaDoc.toXMLStr)
            .fmap(FileHandling.download(docId));
    };
    static resetViewBox = () => {
        Graph.svg().fmap(SVG.ViewBox.setViewBoxVal(Constants.defaultViewBox));
    };
    static showMessage = (message) => {
        const elem = document.querySelector("div.message");
        if (elem == null) {
            throw new Error("No message element");
        }
        elem.textContent = message;
        // Show the message
        HTML.Elem.unsetHidden(elem);
    };
    static hideMessage() {
        const elem = document.querySelector("div.message");
        if (elem == null) {
            throw new Error("No message element");
        }
        elem.textContent = "";
        // Hide the message
        HTML.Elem.setHidden(elem);
    }
    static toggleMessage(message) {
        const elem = document.querySelector("div.message");
        if (elem == null) {
            throw new Error("No message element");
        }
        elem.textContent = message;
        HTML.Elem.toggleHidden(elem);
    }
    static toggleAbout(e) {
        e.stopPropagation();
        Frontend.toggleMessage(Constants.messages.about);
        const messageElem = document.querySelector("div.message");
        const aboutBtn = document.querySelector("#btnAbout");
        if (messageElem?.hidden) {
            aboutBtn?.classList.remove("active");
        }
        else {
            aboutBtn?.classList.add("active");
        }
        UserInput.setClickOutMessageBox(); // For some reason this seems to need to be reset each time... 
    }
    static hideAbout() {
        Frontend.hideMessage();
        const aboutBtn = document.querySelector("#btnAbout");
        aboutBtn?.classList.remove("active");
    }
    // static showAbout() {
    //     Frontend.showMessage(Constants.messages.about)
    //     Frontend.buttonById("btnAbout")
    //         .fmap(HTML.Elem.Class.add("active"))
    // }
    static get textInputShowBtn() {
        return Frontend.buttonById("ToggleShowInputText");
    }
    static get textInputTextArea() {
        return HTML.q("textarea.sentence-text.input");
    }
    static get topToolbarDiv() {
        return HTML.q("div.top.toolbar");
    }
    static setDivClickEvents() {
        const arethusaDivClickFunc = (e) => {
            e.stopPropagation();
            ArethusaDiv.click();
        };
        ArethusaDiv.control
            .fmapErr("No Arethusa Div", HTML.Elem.setOnClickFunc(arethusaDivClickFunc));
        HTML.q("div.message")
            .fmap(HTML.Elem.setOnClickFunc((e) => e.stopPropagation()));
    }
    static setTextAreaClickEvents() {
        const inputTextAreaClickFunc = (e) => {
            e.stopPropagation();
        };
        Frontend.arethusaInputTextArea
            .fmapErr("No arethusaInputTextArea", HTML.Elem.setOnClickFunc(inputTextAreaClickFunc));
        Frontend.epidocInputTextArea
            .fmapErr("No epidocInputTextArea", HTML.Elem.setOnClickFunc(inputTextAreaClickFunc));
        Frontend.textInputTextArea
            .fmapErr("No textInputTextArea", HTML.Elem.setOnClickFunc(inputTextAreaClickFunc));
        Frontend.sentencesDiv
            .fmapErr("No sentencesDiv", HTML.Elem.setOnClickFunc(inputTextAreaClickFunc));
    }
    static setBtnEvents() {
        const epidocExampleBtnFunc = (e) => {
            e.stopPropagation();
            Frontend
                .epidocInputTextArea
                .fmap(TextArea.setValue(epidocFile));
            Frontend.processEpiDoc(epidocFile);
        };
        const arethusaExampleBtnFunc = (e) => {
            e.stopPropagation();
            Frontend
                .arethusaInputTextArea
                .fmap(TextArea.setValue(arethusaUglifiedExample));
            Frontend.processArethusa(arethusaUglifiedExample);
        };
        const loadArethusaBtnFunc = () => {
            FileHandling.loadFromDialog('.xml')(MaybeT.of(Frontend.processArethusa));
        };
        const loadEpiDocBtnFunc = (e) => {
            FileHandling.loadFromDialog('.xml')(MaybeT.of(Frontend.processEpiDoc));
        };
        const loadTextBtnFunc = (e) => {
            FileHandling.loadFromDialog('.txt')(MaybeT.of(Frontend.processText));
        };
        const undoFunc = (e) => {
            e.stopPropagation();
            globalState.undo();
        };
        const redoFunc = (e) => {
            e.stopPropagation();
            globalState.redo();
        };
        const addNewSentenceFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.appendNewSentenceToArethusa);
        };
        const splitSentenceFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.splitSentenceAtCurrentWord);
        };
        const insertSentenceFunc = (e) => {
            e.stopPropagation();
            globalState.textStateIO.fmap(TextStateIO.insertSentence);
        };
        const removeSentenceFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.removeSentence);
        };
        const appendNewWordFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.appendNewWordToSentence);
        };
        const appendNewArtificialFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.appendNewArtificialToSentence);
        };
        const moveWordToNextSentenceFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.moveTokenToNextSentence);
        };
        const moveWordToPrevSentenceFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.moveWordToPrevSentence);
        };
        const removeWordFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.removeArethusaToken);
        };
        const moveTokenUpFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.moveTokenUp);
        };
        const moveTokenDownFunc = (e) => {
            e.stopPropagation();
            globalState
                .textStateIO
                .fmap(TextStateIO.moveTokenDown);
        };
        const nextSentenceFunc = (e) => {
            e.stopPropagation();
            ArethusaDiv.nextSentence();
        };
        const prevSentenceFunc = (e) => {
            e.stopPropagation();
            ArethusaDiv.prevSentence();
        };
        const processEpiDocInputFunc = (e) => {
            e.stopPropagation();
            Frontend
                .epidocInputTextArea
                .fmap(TextArea.value)
                .fmap(Frontend.processEpiDoc);
        };
        const processArethusaInputFunc = (e) => {
            e.stopPropagation();
            Frontend
                .arethusaInputTextArea
                .fmap(TextArea.value)
                .fmap(Frontend.processArethusa);
        };
        const processTextInputFunc = (e) => {
            e.stopPropagation();
            Frontend
                .textInputTextArea
                .fmap(TextArea.value)
                .fmap(Frontend.processText);
        };
        Frontend
            .buttonById("btnAbout")
            .fmapErr("No about button", HTML.Elem.setOnClickFunc(Frontend.toggleAbout));
        Frontend
            .inputShowBtn
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInput));
        Frontend
            .buttonById("saveArethusaFile")
            .fmapErr("No download Arethusa button", HTML.Elem.setOnClickFunc(Frontend.downloadArethusa));
        Frontend
            .buttonById("DrawTreeArethusa")
            .fmap(HTML.Elem.setOnClickFunc(processArethusaInputFunc));
        Frontend
            .buttonById("DrawTreeEpiDoc")
            .fmap(HTML.Elem.setOnClickFunc(processEpiDocInputFunc));
        Frontend
            .buttonById("DrawTreeText")
            .fmap(HTML.Elem.setOnClickFunc(processTextInputFunc));
        Frontend
            .epidocExampleBtn
            .fmap(HTML.Elem.setOnClickFunc(epidocExampleBtnFunc));
        Frontend
            .arethusaExampleBtn
            .fmap(HTML.Elem.setOnClickFunc(arethusaExampleBtnFunc));
        Frontend
            .buttonById("FormatInputArethusa")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.formatInputArethusa));
        Frontend
            .buttonById("FormatInputEpiDoc")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.formatInputEpiDoc));
        Frontend
            .loadArethusaBtn
            .fmap(HTML.Elem.setOnClickFunc(loadArethusaBtnFunc));
        Frontend
            .buttonById("loadEpiDocFile")
            .fmap(HTML.Elem.setOnClickFunc(loadEpiDocBtnFunc));
        Frontend
            .loadTextBtn
            .fmap(HTML.Elem.setOnClickFunc(loadTextBtnFunc));
        Frontend
            .buttonById("MoveGraphDown")
            .fmap(HTML.Elem.setOnClickFunc(() => TreeStateIO.moveGraph(SVG.ViewBox.incrMinY)));
        Frontend
            .buttonById("MoveGraphLeft")
            .fmap(HTML.Elem.setOnClickFunc(() => TreeStateIO.moveGraph(SVG.ViewBox.decrMinX)));
        Frontend
            .buttonById("MoveGraphRight")
            .fmap(HTML.Elem.setOnClickFunc(() => TreeStateIO.moveGraph(SVG.ViewBox.incrMinX)));
        Frontend
            .buttonById("MoveGraphUp")
            .fmap(HTML.Elem.setOnClickFunc(() => TreeStateIO.moveGraph(SVG.ViewBox.decrMinY)));
        Frontend
            .undoBtn
            .fmap(HTML.Elem.setOnClickFunc(undoFunc));
        Frontend
            .redoBtn
            .fmap(HTML.Elem.setOnClickFunc(redoFunc));
        Frontend
            .appendNewSentenceToArethusaBtn
            .fmap(HTML.Elem.setOnClickFunc(addNewSentenceFunc));
        Frontend
            .removeSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(removeSentenceFunc));
        Frontend
            .nextSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(nextSentenceFunc));
        Frontend
            .prevSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(prevSentenceFunc));
        Frontend
            .splitSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(splitSentenceFunc));
        Frontend
            .insertSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(insertSentenceFunc));
        Frontend
            .removeWordBtn
            .fmap(HTML.Elem.setOnClickFunc(removeWordFunc));
        Frontend
            .addNewWordBtn
            .fmap(HTML.Elem.setOnClickFunc(appendNewWordFunc));
        Frontend
            .addNewArtificialBtn
            .fmap(HTML.Elem.setOnClickFunc(appendNewArtificialFunc));
        Frontend
            .moveWordToNextSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(moveWordToNextSentenceFunc));
        Frontend
            .moveWordToPrevSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(moveWordToPrevSentenceFunc));
        Frontend
            .removeWordBtn
            .fmap(HTML.Elem.setOnClickFunc(removeWordFunc));
        Frontend
            .moveUpBtn
            .fmap(HTML.Elem.setOnClickFunc(moveTokenUpFunc));
        Frontend
            .moveDownBtn
            .fmap(HTML.Elem.setOnClickFunc(moveTokenDownFunc));
        Frontend
            .arethusaInputShowBtn
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInputArethusa));
        Frontend
            .epidocInputShowBtn
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInputEpiDoc));
        Frontend
            .buttonById("ToggleShowInput")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInput));
        Frontend
            .buttonById("ToggleShowInputText")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInputText));
        Frontend
            .buttonById("ToggleShowOutputArethusa")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowOutputArethusa));
        Frontend
            .buttonById("ZoomIn")
            .fmap(HTML.Elem.setOnClickFunc(() => TreeStateIO.moveGraph(SVG.ViewBox.zoomIn)));
        Frontend
            .buttonById("ZoomOut")
            .fmap(HTML.Elem.setOnClickFunc(() => TreeStateIO.moveGraph(SVG.ViewBox.zoomOut)));
    }
    static get splitSentenceBtn() {
        return HTML.q("button#SplitSentence");
    }
    static get undoBtn() {
        return HTML.id("UndoTextEdit");
    }
    static toggleShowInput = () => {
        Frontend
            .inputShowBtn
            .fmap(HTML.Elem.Class.toggle("active"));
        Frontend
            .divById("InputDiv")
            .fmap(HTML.Elem.toggleHidden);
    };
    static toggleShowInputText = () => {
        // Arethusa
        Frontend
            .divByQ("arethusa.input")
            .fmap(HTML.Elem.setHidden);
        Frontend
            .arethusaInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"));
        // EpiDoc
        Frontend
            .divByQ("epidoc.input")
            .fmap(HTML.Elem.setHidden);
        Frontend
            .epidocInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"));
        // Text
        Frontend
            .divByQ("sentence-text.input")
            .fmap(HTML.Elem.unsetHidden);
        Frontend
            .buttonById("ToggleShowInputText")
            .fmap(HTML.Elem.Class.add("active"));
    };
    static toggleShowInputEpiDoc = () => {
        // Arethusa
        Frontend
            .divByQ("arethusa.input")
            .fmap(HTML.Elem.setHidden);
        Frontend
            .arethusaInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"));
        // Text
        Frontend
            .divByQ("sentence-text.input")
            .fmap(HTML.Elem.setHidden);
        Frontend
            .buttonById("ToggleShowInputText")
            .fmap(HTML.Elem.Class.remove("active"));
        // EpiDoc
        Frontend
            .divByQ("epidoc.input")
            .fmap(HTML.Elem.unsetHidden);
        Frontend
            .epidocInputShowBtn
            .fmap(HTML.Elem.Class.add("active"));
    };
    static toggleShowInputArethusa = () => {
        // EpiDoc
        Frontend
            .divByQ("epidoc.input")
            .fmap(HTML.Elem.setHidden);
        Frontend
            .epidocInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"));
        // Text
        Frontend
            .divByQ("sentence-text.input")
            .fmap(HTML.Elem.setHidden);
        Frontend
            .textInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"));
        // Arethusa
        Frontend
            .divByQ("arethusa.input")
            .fmap(HTML.Elem.unsetHidden);
        Frontend
            .arethusaInputShowBtn
            .fmap(HTML.Elem.Class.add("active"));
    };
    static toggleShowOutputArethusa = () => {
        Frontend
            .arethusaOutputDiv
            .fmap(HTML.Elem.toggleHidden);
        Frontend
            .arethusaOutputToolbar
            .fmap(HTML.Elem.toggleHidden);
        Frontend
            .arethusaOutputShowBtn
            .fmap(HTML.Elem.Class.toggle("active"));
    };
    /**
     * Highlights the text in xmlToHighLight in the arethusaDiv element
     * @param arethusaDocXMLStr the XML string of the whole Arethusa XML document
     * @returns
     */
    static updateArethusaDiv = (arethusaDocXMLStr) => (nodeToHighlight) => (arethusaDiv) => {
        if (nodeToHighlight.value == null) {
            return;
        }
        const node = nodeToHighlight.value;
        const text = XML.toStr(node._node);
        const firstIndexOf = arethusaDocXMLStr.indexOf(text);
        const lastIndexOf = firstIndexOf + text.length;
        const textToPrepend = arethusaDocXMLStr.substring(0, firstIndexOf);
        const spanText = arethusaDocXMLStr.substring(firstIndexOf, lastIndexOf + 1);
        const textToAppend = arethusaDocXMLStr.substring(lastIndexOf + 1);
        const span = document.createElement("span");
        span.classList.add("selected");
        span.append(spanText);
        arethusaDiv.replaceChildren("");
        arethusaDiv.append(textToPrepend, span, textToAppend);
    };
    static updateTextArea = (newText) => (control) => {
        const setToNewText = TextArea.setValue(newText);
        const updatedTextarea = MaybeT.of(control)
            .fmap(TextArea.setValue(""))
            .fmap(setToNewText);
        return updatedTextarea;
    };
}
