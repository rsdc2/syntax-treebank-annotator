class Frontend {

    static get addNewWordBtn() {
        return Frontend.buttonById("AddNewWord")
    }

    static get arethusaOutputDiv() {
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

    static get inputArethusa(): Maybe<Arethusa> {
        return Frontend.inputArethusaXML
            .bind(Arethusa.fromXMLStr)
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
        Frontend.saveCurrentState()

        const arethusa = MaybeT
            .of(arethusaStr)
            .bind(Arethusa.fromXMLStr)

        const textstate = TextState.of(
            arethusa.fmap(ViewState.of("1")("1")),
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
    }

    static processText = (textStr: string) => {
        Frontend.saveCurrentState()

        const arethusa = MaybeT
            .of(textStr)
            .bind(Arethusa.fromPlainTextStr)

        const textstate = TextState.of(
            arethusa.fmap(ViewState.of("1")("1")),
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

    static showMessage(message:string) {
        HTML.q("div.message")
            .bindErr("No message element.", HTML.setInnerHTML(message))
            .fmap(HTML.Elem.unsetHidden)
    }

    static hideMessage() {
        HTML.q("div.message")
            .bindErr("No message element.", HTML.setInnerHTML(""))
            .fmap(HTML.Elem.setHidden)
    }

    static toggleMessage(message:string) {
        HTML.q("div.message")
            .bindErr(
                "No message element.", 
                HTML.setInnerHTML(message)
            )
            .fmap(HTML.Elem.toggleHidden)

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
            .fmapErr("No Arethusa Div", HTML.Elem.setOnclickFunc(arethusaDivClickFunc))

    }

    static setTextAreaClickEvents() {
        const inputTextAreaClickFunc = (e: Event) => {
            e.stopPropagation()
        }

        Frontend.arethusaInputTextArea
            .fmapErr("No arethusaInputTextArea", HTML.Elem.setOnclickFunc(inputTextAreaClickFunc))
        Frontend.epidocInputTextArea
            .fmapErr("No arethusaInputTextArea", HTML.Elem.setOnclickFunc(inputTextAreaClickFunc))
        Frontend.textInputTextArea
            .fmapErr("No arethusaInputTextArea", HTML.Elem.setOnclickFunc(inputTextAreaClickFunc))

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
            globalState.textStateIO.fmap(TextStateIO.appendNewSentenceToArethusa)
        }

        const splitSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.splitSentenceAtCurrentWord)
        }

        const insertSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.insertSentence)
        }

        const removeSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.removeSentence)
        }

        const appendNewWordFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.appendNewWordToSentence)
        }

        const moveWordToNextSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.moveWordToNextSentence)
        }

        const moveWordToPrevSentenceFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.moveWordToPrevSentence)
        }

        const removeWordFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.removeArethusaWord)
        }

        const moveWordUpFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.moveWordUp)
        }

        const moveWordDownFunc = (e: Event) => {
            e.stopPropagation()
            globalState.textStateIO.fmap(TextStateIO.moveWordDown)
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
            .fmapErr("No about button", HTML.Elem.setOnclickFunc(Frontend.toggleAbout))

        Frontend
            .inputShowBtn
            .fmap(HTML.Elem.setOnclickFunc(Frontend.toggleShowInput))

        Frontend
            .buttonById("DrawTreeArethusa")
            .fmap(HTML.Elem.setOnclickFunc(processArethusaInputFunc))

        Frontend
            .buttonById("DrawTreeEpiDoc")
            .fmap(HTML.Elem.setOnclickFunc(processEpiDocInputFunc))

        Frontend
            .buttonById("DrawTreeText")
            .fmap(HTML.Elem.setOnclickFunc(processTextInputFunc))

        Frontend
            .epidocExampleBtn
            .fmap(HTML.Elem.setOnclickFunc(epidocExampleBtnFunc))

        Frontend
            .arethusaExampleBtn
            .fmap(HTML.Elem.setOnclickFunc(arethusaExampleBtnFunc))

        Frontend
            .undoBtn
            .fmap(HTML.Elem.setOnclickFunc(undoFunc))

        Frontend
            .redoBtn
            .fmap(HTML.Elem.setOnclickFunc(redoFunc))

        Frontend
            .appendNewSentenceToArethusaBtn
            .fmap(HTML.Elem.setOnclickFunc(addNewSentenceFunc))

        Frontend
            .removeSentenceBtn
            .fmap(HTML.Elem.setOnclickFunc(removeSentenceFunc))


        Frontend
            .splitSentenceBtn
            .fmap(HTML.Elem.setOnclickFunc(splitSentenceFunc))

        Frontend
            .insertSentenceBtn
            .fmap(HTML.Elem.setOnclickFunc(insertSentenceFunc))

        Frontend
            .removeWordBtn
            .fmap(HTML.Elem.setOnclickFunc(removeWordFunc))
    
        Frontend
            .addNewWordBtn
            .fmap(HTML.Elem.setOnclickFunc(appendNewWordFunc))
    
        Frontend
            .moveWordToNextSentenceBtn
            .fmap(HTML.Elem.setOnclickFunc(moveWordToNextSentenceFunc))
        
        Frontend
            .moveWordToPrevSentenceBtn
            .fmap(HTML.Elem.setOnclickFunc(moveWordToPrevSentenceFunc))

        Frontend
            .removeWordBtn
            .fmap(HTML.Elem.setOnclickFunc(removeWordFunc))

        Frontend
            .moveUpBtn
            .fmap(HTML.Elem.setOnclickFunc(moveWordUpFunc))

        Frontend
            .moveDownBtn
            .fmap(HTML.Elem.setOnclickFunc(moveWordDownFunc))
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

    static updateArethusaDiv = (newXML: string) => 
        (xmlToHighlight: Maybe<string>) => 
        // (wordNodesXML: string[]) => 
        (arethusaDiv: HTMLDivElement) => {

        // const formattedWordNodes = wordNodesXML
        //     .map(ArethusaDiv.formatXMLForDiv)
        
        const formattedHighlighted = xmlToHighlight
            .fmap(ArethusaDiv.formatXMLForDiv)
            .unpackT("")

        const setTextContent = MaybeT.of(newXML)
            .fmap(ArethusaDiv.formatXMLForDiv)
            .fmap(Str.replace(formattedHighlighted) ('<span style="color:blue" class="selected">' + formattedHighlighted + "</span>"))
            .fmap(Div.setInnerHTML)

        MaybeT.of(arethusaDiv)
            .applyFmap(setTextContent)
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