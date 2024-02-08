/**
 * Processes input from epidoc, arethusa and plain text
 */

class InputProcessor {
    static processEpiDoc (epidocStr: string): boolean {
        Frontend.saveCurrentState()

        try {
            const epidoc = EpiDoc.fromXMLStr_(epidocStr)

            TEIValidator.assertValid(epidoc)

            const arethusa = MaybeT
                .of(epidocStr)
                .bind(Conversion.epidocXMLToArethusa)
                
            arethusa.fmap(ArethusaValidator.assertValid)

            const textState = TextState.of(
                arethusa.fmap(ViewState.of("1")("1")),
                Nothing.of(),
                Nothing.of(),
                Nothing.of(),
                arethusa,
                arethusa,
                MaybeT.of(epidoc)
            )

            globalState
                .textStateIO
                .fmapErr(
                    "No textStateIO",
                    TextStateIO.appendNewState(false)(textState)
                )            

            globalState.createTreeStateIO()
            globalState.graph()
            return true
            
        } catch (e) {
            return ErrorHandler.printErrorMsgSpecific([
                    XMLParseError, 
                    ValidationError,
                    TokenCountError,
                    SentenceCountError,
                    TokensPerSentenceError
                ], e
            )
        }
    }

    static processArethusa (arethusaStr: string): boolean {
        Frontend.saveCurrentState()

        try {
            const arethusa = ArethusaDoc.fromXMLStr_(arethusaStr)
            ArethusaValidator.assertValid(arethusa)

            const renumbered = MaybeT.of(arethusa)
                .bind(ArethusaDoc.renumberTokenIds(true))

            const textstate = TextState.of(
                renumbered.fmap(ViewState.of("1")("1")),
                Nothing.of(),
                Nothing.of(),
                Nothing.of(),
                MaybeT.of(arethusa),
                MaybeT.of(arethusa),
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
            return true

        } catch (e) {
            return ErrorHandler.printErrorMsgSpecific([
                XMLParseError, 
                ValidationError,
                TokenCountError,
                SentenceCountError,
                TokensPerSentenceError
            ], e
        )
        }
    }

    static processText(textStr: string) {

        if (textStr === "") {
            return
        }
        try {
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
        } catch (e) {
            return ErrorHandler.printErrorMsgSpecific([
                    XMLParseError, 
                    ValidationError,
                    TokenCountError,
                    SentenceCountError,
                    TokensPerSentenceError
                ], e
            )
        }
    }

}