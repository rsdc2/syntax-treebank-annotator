class Frontend {
    static get addNewArtificialBtn() {
        return Frontend.buttonById("AddNewArtificial")
    }

    static get addNewWordBtn() {
        return Frontend.buttonById("AddNewWord")
    }

    static get arethusaOutputDiv(): Maybe<HTMLDivElement> {
        return ArethusaDiv.control
    }

    static get arethusaInputTextArea() {
        return HTML.q("textarea#dstXML") as Maybe<HTMLTextAreaElement>
    }

    static get inputArethusaXML(): Maybe<string> {
        return Frontend
            .arethusaInputTextArea
            .fmap(HTML.value)   
    } 

    static get inputPlainText() {
        return HTML.q("sentence-text input") as Maybe<TextArea>
    }

    static get inputArethusa(): Maybe<ArethusaDoc> {
        return Frontend.inputArethusaXML
            .bind(ArethusaDoc.fromXMLStr)
    }

    static get appendNewSentenceToArethusaBtn() {
        return Frontend.buttonById("AddNewSentence") 
    }

    static get arethusaExampleBtn() {
        return Frontend.buttonById("ExampleArethusa") 
    }

    static get arethusaOutputToolbar() {
        return HTML.q("div.arethusa.output.toolbar") as Maybe<HTMLDivElement>
    }
    
    static get arethusaOutputShowBtn() {
        return Frontend.buttonById("ToggleShowOutputArethusa")
    }

    static get arethusaInputShowBtn() {
        return Frontend.buttonById("ToggleShowInputArethusa")
    }

    static get arethusaInputToolbar() {
        return HTML.q("div.arethusa.input.toolbar") as Maybe<HTMLDivElement>
    }

    static buttonById(htmlId: string): Maybe<HTMLButtonElement> {
        const msg = `No button with id ${htmlId}.`
        return HTML.qThrow(msg, `button#${htmlId}`) as Maybe<HTMLButtonElement>
    }   

    static buttonByQ(query:string): Maybe<HTMLDivElement> {
        const msg = `No div with class button.${query}.`
        return HTML.qThrow(msg, `button.${query}`) as Maybe<HTMLDivElement>
    }

    static divById(htmlId:string): Maybe<HTMLDivElement> {
        const msg = `No div with id ${htmlId}.`
        return HTML.qThrow(msg, `div#${htmlId}`) as Maybe<HTMLDivElement>
    }

    static divByQ(query:string): Maybe<HTMLDivElement> {
        const msg = `No div with class div.${query}.`
        return HTML.qThrow(msg, `div.${query}`) as Maybe<HTMLDivElement>
    }

    static get epidocExampleBtn() {
        return Frontend.buttonById("ExampleEpiDoc") 
    }

    static get epidocInputTextArea() {
        return HTML.q("textarea#srcXML") as Maybe<HTMLTextAreaElement>
    }

    static get epidocInputToolbar() {
        return HTML.q("div.epidoc.input.toolbar") as Maybe<HTMLDivElement>
    }

    static get epidocInputShowBtn() {
        return Frontend.buttonById("ToggleShowInputEpiDoc")
    }

    static get epidocXML() {
        return Frontend
            .epidocInputTextArea
            .fmapErr("No EpiDoc input text area.", HTML.value)   
    } 

    static get epidoc(): Maybe<EpiDoc> {
        return Frontend.epidocXML
            .bindErr("No epidoc XMl", EpiDoc.fromXMLStr)
    }

    static get plainText(): Maybe<string> {
        return Frontend
            .inputPlainText
            .fmap(TextArea.value)
    }

    static formatInputEpiDoc=() => {
        Frontend
            .epidocInputTextArea
            .fmap(TextArea.value)
            .fmap(Frontend.processEpiDoc)

        globalState
            .textStateIO
            .fmapErr("No textStateIO", TextStateIO.formatInputEpiDoc)
    }

    static formatInputArethusa=() => {
        Frontend
            .arethusaInputTextArea
            .fmap(TextArea.value)
            .fmap(Frontend.processArethusa)

        globalState
            .textStateIO
            .fmapErr("No textStateIO", TextStateIO.formatInputArethusa)
    }


    static saveCurrentState = () => {
        if (globalState.textStateIO.isNothing) {
            globalState.createTextStateIO(
                Nothing.of(),
                Nothing.of(),
                Nothing.of()
            )
        } 

        const textState = TextState.of(
            globalState
                .textStateIO
                .bind(TextStateIO.currentState)
                .bind(TextState.viewState),
            globalState
                .textStateIO
                .bind(TextStateIO.currentState)
                .bind(TextState.sentenceVSDeep),
            Nothing.of(),
            Frontend.plainText,
            Frontend.inputArethusa,
            globalState
                .textStateIO
                .bind(TextStateIO.currentState)
                .bind(TextState.outputArethusaDeep),
            Frontend.epidoc
        )

        globalState
            .textStateIO
            .fmapErr(
                "No textStateIO",
                TextStateIO.appendNewState(false)(textState)
            )            
    }

    static processEpiDoc = (epidocStr: string) => {

        Frontend.saveCurrentState()

        const epidoc = EpiDoc.fromXMLStr(epidocStr)
        const arethusa = MaybeT
            .of(epidocStr)
            .bind(Conversion.epidocXMLToArethusa)

        const textState = TextState.of(
            arethusa.fmap(ViewState.of("1")("1")),
            Nothing.of(),
            Nothing.of(),
            Nothing.of(),
            arethusa,
            arethusa,
            epidoc
        )

        globalState
            .textStateIO
            .fmapErr(
                "No textStateIO",
                TextStateIO.appendNewState(false)(textState)
            )            

        globalState.createTreeStateIO()
        globalState.graph()
    }

    static processArethusa = (arethusaStr: string) => {

        try {
            Frontend.saveCurrentState()
            const arethusa = ArethusaDoc.fromXMLStr(arethusaStr)

            const renumbered = arethusa
                .bind(ArethusaDoc.renumberTokenIds(true))
            
            const textstate = TextState.of(
                renumbered.fmap(ViewState.of("1")("1")),
                Nothing.of(),
                Nothing.of(),
                Nothing.of(),
                arethusa,
                arethusa,
                Nothing.of()
            )
                        
            globalState
                .textStateIO
                .fmapErr(
                    "No textStateIO",
                    TextStateIO.appendNewState(false)(textstate)
                )    
                            
            globalState.createTreeStateIO()
                globalState.graph()
        } catch (error) {
            if (error instanceof XMLParseError) {
                const outputArethusaDiv = ArethusaDiv.control._value
                if (outputArethusaDiv != null) {
                    outputArethusaDiv.replaceChildren(
                        "ERROR: Could not parse XML, likely because the XML contains an error."
                    )
                } else {
                    throw new Error("Missing output div element")
                }
            } else {
                throw error
            }
        }
    }

    static processText = (textStr: string) => {

        if (textStr === "") {
            return
        }
        Frontend.saveCurrentState()

        const arethusa = MaybeT
            .of(textStr)
            .bind(ArethusaDoc.fromPlainTextStr)

        const textstate = TextState.of(
            arethusa.fmap(ViewState.of("1")("1")),
            Nothing.of(),
            Nothing.of(),
            MaybeT.of(textStr),
            arethusa,
            arethusa,
            Nothing.of()
        )

        globalState
            .textStateIO
            .fmapErr(
                "No textStateIO",
                TextStateIO.appendNewState(false)(textstate)
            )                

        globalState.createTreeStateIO()
        globalState.graph()
    }

    static pushPlainTextToFrontend = (textStateIO: TextStateIO) => {
        const plainText = textStateIO
            .currentState
            .bind(TextState.plainText)
    
        if (plainText.isNothing) {
            Frontend
                .textInputTextArea
                .applyFmap( MaybeT.of("").fmap(Frontend.updateTextArea) )
            return 
        }
    
        Frontend
            .textInputTextArea
            .applyBind( plainText.fmap(Frontend.updateTextArea) )
    }    

    static get insertSentenceBtn() {
        return Frontend.buttonById("InsertSentence")
    }

    static get inputShowBtn() {
        return Frontend.buttonById("ToggleShowInput")
    }

    static get leftBoundaryDiv() {
        return HTML.q("div.left.boundary") as Maybe<HTMLDivElement>
    }

    static get loadArethusaBtn() {
        return Frontend.buttonById("loadFile")
    }

    static get loadTextBtn() {
        return Frontend.buttonById("loadTextFile")
    }

    static get moveWordToNextSentenceBtn() {
        return Frontend.buttonById("PushToNextSentence")
    }

    static get moveWordToPrevSentenceBtn() {
        return Frontend.buttonById("PushToPreviousSentence")
    }

    static get moveUpBtn() {
        return Frontend.buttonById("MoveUp")
    }

    static get moveDownBtn() {
        return Frontend.buttonById("MoveDown")
    }

    static get nextSentenceBtn() {
        return Frontend.buttonById("NextSentence")
    }

    static get prevSentenceBtn() {
        return Frontend.buttonById("PrevSentence")
    }

    static get redoBtn() {
        return Frontend.buttonById("RedoTextEdit")
    }

    static get pushToNextSentenceBtn() {
        return Frontend.buttonById("PushToNextSentence")
    }

    static get pushToPrevSentenceBtn() {
        return Frontend.buttonById("PushToPreviousSentence")
    }

    static get removeSentenceBtn() {
        return Frontend.buttonById("RemoveSentence")
    }

    static get removeWordBtn() {
        return Frontend.buttonById("RemoveWord")
    }

    static get sentencesDiv() {
        return MaybeT.of(document.getElementById("sentencesDiv"))
    }

    static downloadArethusa = () => {
        const arethusa = globalState
            .textStateIO
            .bind(TextStateIO.currentState)
            .bind(TextState.outputArethusaDeep)
        
        const docId = arethusa
            .bind(ArethusaDoc.docId)
            .fromMaybe("tree")

        arethusa
            .fmap(ArethusaDoc.toXMLStr)
            .fmap(FileHandling.download(docId))
    }

    static resetViewBox = () => {
        Graph.svg().fmap(SVG.ViewBox.setViewBoxVal(Constants.defaultViewBox))
    }

    static showMessage = (message: string) => {
        const elem = document.querySelector<HTMLDivElement>("div.message")
        if (elem == null) {
            throw new Error("No message element")
        }
        elem.textContent = message

        // Show the message
        HTML.Elem.unsetHidden(elem)
    }

    static hideMessage() {
        const elem = document.querySelector<HTMLDivElement>("div.message")
        if (elem == null) {
            throw new Error("No message element")
        }
        elem.textContent = ""

        // Show the message
        HTML.Elem.setHidden(elem)
    }

    static toggleMessage(message: string) {
        const elem = document.querySelector<HTMLDivElement>("div.message")
        if (elem == null) {
            throw new Error("No message element")
        }
        elem.textContent = message
        HTML.Elem.toggleHidden(elem)
    }

    static toggleAbout(e: MouseEvent) {
        e.stopPropagation()
        Frontend.toggleMessage(Constants.messages.about)
        Frontend.buttonById("btnAbout")
            .fmap(HTML.Elem.Class.toggle("active"))
    }

    static hideAbout() {
        Frontend.hideMessage()
        Frontend.buttonById("btnAbout")
            .fmap(HTML.Elem.Class.remove("active"))
    }

    static showAbout() {
        Frontend.showMessage(Constants.messages.about)
        Frontend.buttonById("btnAbout")
            .fmap(HTML.Elem.Class.add("active"))
    }

    static get textInputShowBtn() {
        return Frontend.buttonById("ToggleShowInputText")
    }

    static get textInputTextArea() {
        return HTML.q("textarea.sentence-text.input") as Maybe<HTMLTextAreaElement>
    }

    static get topToolbarDiv() {
        return HTML.q("div.top.toolbar") as Maybe<HTMLDivElement>
    }

    static setDivClickEvents() {
        const arethusaDivClickFunc = (e: Event) => {
            e.stopPropagation()
            ArethusaDiv.click()
        }

        ArethusaDiv.control
            .fmapErr("No Arethusa Div", HTML.Elem.setOnClickFunc(arethusaDivClickFunc))

    }

    static setTextAreaClickEvents() {
        const inputTextAreaClickFunc = (e: Event) => {
            e.stopPropagation()
        }

        Frontend.arethusaInputTextArea
            .fmapErr("No arethusaInputTextArea", HTML.Elem.setOnClickFunc(inputTextAreaClickFunc))
        Frontend.epidocInputTextArea
            .fmapErr("No epidocInputTextArea", HTML.Elem.setOnClickFunc(inputTextAreaClickFunc))
        Frontend.textInputTextArea
            .fmapErr("No textInputTextArea", HTML.Elem.setOnClickFunc(inputTextAreaClickFunc))
        Frontend.sentencesDiv
            .fmapErr("No sentencesDiv", HTML.Elem.setOnClickFunc(inputTextAreaClickFunc))

    }

    static setBtnEvents() {

        const epidocExampleBtnFunc = (e: Event) => {
            e.stopPropagation()
            Frontend
                .epidocInputTextArea
                .fmap(TextArea.setValue(epidocFile))

            Frontend.processEpiDoc(epidocFile)

        }

        const arethusaExampleBtnFunc = (e: Event) => {
            e.stopPropagation()
            Frontend
                .arethusaInputTextArea
                .fmap(TextArea.setValue(arethusaUglifiedExample))

            Frontend.processArethusa(arethusaUglifiedExample)
        }

        const loadArethusaBtnFunc = () => {
            FileHandling.loadFromDialog('.xml')(MaybeT.of(Frontend.processArethusa))

        }

        const loadEpiDocBtnFunc = (e: Event) => {
            FileHandling.loadFromDialog
                      ('.xml')
                      (MaybeT.of(Frontend.processEpiDoc))
        }

        const loadTextBtnFunc = (e: Event) => {
            FileHandling.loadFromDialog('.txt')(MaybeT.of(Frontend.processText))
        }

        const undoFunc = (e: Event) => {
            e.stopPropagation()
            globalState.undo()
        }

        const redoFunc = (e: Event) => {
            e.stopPropagation()
            globalState.redo()
        }

        const addNewSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.appendNewSentenceToArethusa)
        }

        const splitSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.splitSentenceAtCurrentWord)
        }

        const insertSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.insertSentence)
        }

        const removeSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.removeSentence)
        }

        const appendNewWordFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.appendNewWordToSentence)
        }

        const appendNewArtificialFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.appendNewArtificialToSentence)
        }

        const moveWordToNextSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.moveTokenToNextSentence)
        }

        const moveWordToPrevSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.moveWordToPrevSentence)
        }

        const removeWordFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.removeArethusaToken)
        }

        const moveTokenUpFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.moveTokenUp)
        }

        const moveTokenDownFunc = (e: Event) => {
            e.stopPropagation()
            globalState
                .textStateIO
                .fmap(TextStateIO.moveTokenDown)
        }

        const nextSentenceFunc = (e: Event) => {
            e.stopPropagation()
            ArethusaDiv.nextSentence()
        }

        const prevSentenceFunc = (e: Event) => {
            e.stopPropagation()
            ArethusaDiv.prevSentence()
        }

        const processEpiDocInputFunc = (e: Event) => {
            e.stopPropagation()
            Frontend
                .epidocInputTextArea
                .fmap(TextArea.value)
                .fmap(Frontend.processEpiDoc)
        }

        const processArethusaInputFunc = (e: Event) => {
            e.stopPropagation()
            Frontend
                .arethusaInputTextArea
                .fmap(TextArea.value)
                .fmap(Frontend.processArethusa)
        }

        const processTextInputFunc = (e: Event) => {
            e.stopPropagation()
            Frontend
                .textInputTextArea
                .fmap(TextArea.value)
                .fmap(Frontend.processText)
        }

        Frontend
            .buttonById("btnAbout")
            .fmapErr("No about button", HTML.Elem.setOnClickFunc(Frontend.toggleAbout))

        Frontend
            .inputShowBtn
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInput))

        Frontend
            .buttonById("saveArethusaFile")
            .fmapErr("No download Arethusa button", HTML.Elem.setOnClickFunc(Frontend.downloadArethusa))

        Frontend
            .buttonById("DrawTreeArethusa")
            .fmap(HTML.Elem.setOnClickFunc(processArethusaInputFunc))

        Frontend
            .buttonById("DrawTreeEpiDoc")
            .fmap(HTML.Elem.setOnClickFunc(processEpiDocInputFunc))

        Frontend
            .buttonById("DrawTreeText")
            .fmap(HTML.Elem.setOnClickFunc(processTextInputFunc))

        Frontend
            .epidocExampleBtn
            .fmap(HTML.Elem.setOnClickFunc(epidocExampleBtnFunc))

        Frontend
            .arethusaExampleBtn
            .fmap(HTML.Elem.setOnClickFunc(arethusaExampleBtnFunc))

        Frontend
            .buttonById("FormatInputArethusa")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.formatInputArethusa))

        Frontend
            .buttonById("FormatInputEpiDoc")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.formatInputEpiDoc))

        Frontend
            .loadArethusaBtn
            .fmap(HTML.Elem.setOnClickFunc(loadArethusaBtnFunc))

        Frontend
            .buttonById("loadEpiDocFile")
            .fmap(HTML.Elem.setOnClickFunc(loadEpiDocBtnFunc))
        
        Frontend
            .loadTextBtn
            .fmap(HTML.Elem.setOnClickFunc(loadTextBtnFunc))

        Frontend
            .buttonById("MoveGraphDown")
            .fmap(HTML.Elem.setOnClickFunc( () => TreeStateIO.moveGraph(SVG.ViewBox.incrMinY) ))

        Frontend
            .buttonById("MoveGraphLeft")
            .fmap(HTML.Elem.setOnClickFunc( () => TreeStateIO.moveGraph(SVG.ViewBox.decrMinX) ))

        Frontend
            .buttonById("MoveGraphRight")
            .fmap(HTML.Elem.setOnClickFunc( () => TreeStateIO.moveGraph(SVG.ViewBox.incrMinX) ))

        Frontend
            .buttonById("MoveGraphUp")
            .fmap(HTML.Elem.setOnClickFunc( () => TreeStateIO.moveGraph(SVG.ViewBox.decrMinY) ))

        Frontend
            .undoBtn
            .fmap(HTML.Elem.setOnClickFunc(undoFunc))

        Frontend
            .redoBtn
            .fmap(HTML.Elem.setOnClickFunc(redoFunc))

        Frontend
            .appendNewSentenceToArethusaBtn
            .fmap(HTML.Elem.setOnClickFunc(addNewSentenceFunc))

        Frontend
            .removeSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(removeSentenceFunc))

        Frontend
            .nextSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(nextSentenceFunc))

        Frontend
            .prevSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(prevSentenceFunc))


        Frontend
            .splitSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(splitSentenceFunc))

        Frontend
            .insertSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(insertSentenceFunc))

        Frontend
            .removeWordBtn
            .fmap(HTML.Elem.setOnClickFunc(removeWordFunc))
    
        Frontend
            .addNewWordBtn
            .fmap(HTML.Elem.setOnClickFunc(appendNewWordFunc))

        Frontend
            .addNewArtificialBtn
            .fmap(HTML.Elem.setOnClickFunc(appendNewArtificialFunc))


        Frontend
            .moveWordToNextSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(moveWordToNextSentenceFunc))
        
        Frontend
            .moveWordToPrevSentenceBtn
            .fmap(HTML.Elem.setOnClickFunc(moveWordToPrevSentenceFunc))

        Frontend
            .removeWordBtn
            .fmap(HTML.Elem.setOnClickFunc(removeWordFunc))

        Frontend
            .moveUpBtn
            .fmap(HTML.Elem.setOnClickFunc(moveTokenUpFunc))

        Frontend
            .moveDownBtn
            .fmap(HTML.Elem.setOnClickFunc(moveTokenDownFunc))

        Frontend
            .arethusaInputShowBtn
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInputArethusa))

        Frontend
            .epidocInputShowBtn
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInputEpiDoc))

        Frontend
            .buttonById("ToggleShowInput")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInput))

        Frontend
            .buttonById("ToggleShowInputText")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowInputText))

        Frontend
            .buttonById("ToggleShowOutputArethusa")
            .fmap(HTML.Elem.setOnClickFunc(Frontend.toggleShowOutputArethusa))

        Frontend
            .buttonById("ZoomIn")
            .fmap(HTML.Elem.setOnClickFunc( () => TreeStateIO.moveGraph(SVG.ViewBox.zoomIn) ))

        Frontend
            .buttonById("ZoomOut")
            .fmap(HTML.Elem.setOnClickFunc( () => TreeStateIO.moveGraph(SVG.ViewBox.zoomOut) ))


    }

    static get splitSentenceBtn() {
        return HTML.q("button#SplitSentence")
    }

    static get undoBtn() {
        return HTML.id("UndoTextEdit")
    }

    static toggleShowInput = () => {
        Frontend
            .inputShowBtn
            .fmap(HTML.Elem.Class.toggle("active"))

        // Frontend
        //     .epidocInputShowBtn
        //     .fmap(HTML.Elem.toggleHidden)

        // Frontend
        //     .arethusaInputShowBtn
        //     .fmap(HTML.Elem.toggleHidden)

        // Frontend
        //     .textInputShowBtn
        //     .fmap(HTML.Elem.toggleHidden)

        Frontend
            .divById("InputDiv")
            .fmap(HTML.Elem.toggleHidden)

    }

    static toggleShowInputText = () => {
        // Arethusa
        Frontend
            .divByQ("arethusa.input")
            .fmap(HTML.Elem.setHidden)

        Frontend
            .arethusaInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"))
            
        // EpiDoc
        Frontend
            .divByQ("epidoc.input")
            .fmap(HTML.Elem.setHidden)

        Frontend
            .epidocInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"))

        // Text
        Frontend
            .divByQ("sentence-text.input")
            .fmap(HTML.Elem.unsetHidden)

        Frontend
            .buttonById("ToggleShowInputText")
            .fmap(HTML.Elem.Class.add("active"))
    }

    static toggleShowInputEpiDoc = () => {
        // Arethusa
        Frontend
            .divByQ("arethusa.input")
            .fmap(HTML.Elem.setHidden)

        Frontend
            .arethusaInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"))

        // Text
        Frontend
            .divByQ("sentence-text.input")
            .fmap(HTML.Elem.setHidden)

        Frontend
            .buttonById("ToggleShowInputText")
            .fmap(HTML.Elem.Class.remove("active"))

        // EpiDoc
        Frontend
            .divByQ("epidoc.input")
            .fmap(HTML.Elem.unsetHidden)

        Frontend
            .epidocInputShowBtn
            .fmap(HTML.Elem.Class.add("active"))
    }
     
    static toggleShowInputArethusa = () => {
        // EpiDoc
        Frontend
            .divByQ("epidoc.input")
            .fmap(HTML.Elem.setHidden)

        Frontend
            .epidocInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"))

        // Text
        Frontend
            .divByQ("sentence-text.input")
            .fmap(HTML.Elem.setHidden)

        Frontend
            .textInputShowBtn
            .fmap(HTML.Elem.Class.remove("active"))

        // Arethusa
        Frontend
            .divByQ("arethusa.input")
            .fmap(HTML.Elem.unsetHidden)

        Frontend
            .arethusaInputShowBtn
            .fmap(HTML.Elem.Class.add("active"))
    }

    static toggleShowOutputArethusa = () => {
        Frontend
            .arethusaOutputDiv
            .fmap(HTML.Elem.toggleHidden)

        Frontend
            .arethusaOutputToolbar
            .fmap(HTML.Elem.toggleHidden)

        Frontend
            .arethusaOutputShowBtn
            .fmap(HTML.Elem.Class.toggle("active"))
    }


    /**
     * Highlights the text in xmlToHighLight in the arethusaDiv element
     * @param arethusaDocXMLStr the XML string of the whole Arethusa XML document
     * @returns 
     */
    static updateArethusaDiv = 
        (arethusaDocXMLStr: string) => 
        (nodeToHighlight: Maybe<ArethusaWord | ArethusaSentence>) => 
        (arethusaDiv: HTMLDivElement): void => {

        if (nodeToHighlight.value == null) {
            return
        }
        const node = nodeToHighlight.value
        const text = XML.toStr(node._node)
        
        const firstIndexOf = arethusaDocXMLStr.indexOf(text)
        const lastIndexOf = firstIndexOf + text.length

        const textToPrepend = arethusaDocXMLStr.substring(0, firstIndexOf)

        const spanText = arethusaDocXMLStr.substring(firstIndexOf, lastIndexOf + 1)
        const textToAppend = arethusaDocXMLStr.substring(lastIndexOf + 1)

        const span = document.createElement("span")
        span.classList.add("selected")
        span.append(spanText)

        arethusaDiv.replaceChildren("")
        arethusaDiv.append(textToPrepend, span, textToAppend)
    }

    static updateTextArea = (newText: string) => 
        (control: HTMLTextAreaElement) =>
    {
        const setToNewText = TextArea.setValue(newText)
    
        const updatedTextarea = MaybeT.of(control)
            .fmap(TextArea.setValue(""))
            .fmap(setToNewText)
        
        return updatedTextarea
    }
} 