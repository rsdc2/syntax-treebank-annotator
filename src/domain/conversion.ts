class Conversion {
    static epidocToArethusa = (epidoc: EpiDoc) => {
        return MaybeT.of(epidoc)
            .fmap(EpiDoc.toXMLStr)
            .bind(Conversion.epidocXMLToArethusaXML)
            .bind(ArethusaDoc.fromXMLStr)
    }

    static epidocXMLToArethusa = (epidocXML: string) => {
        return MaybeT.of(epidocXML)
            .bind(Conversion.epidocXMLToArethusaXML)
            .bind(ArethusaDoc.fromXMLStr)
    }

    static epidocXMLToArethusaXML = (epidocXML: string) => {

        const epidoc = 
            MaybeT.of(
                XML.fromXMLStr(epidocXML)
            )
            .fmap(XMLFormatter.deprettifyFromRoot(true))
            .fmap(XML.toStr)
            .bind(EpiDoc.fromXMLStr)
    
        const docId = epidoc
            .bind(EpiDoc.filenameId)
            .unpackT("")

        const tokens = epidoc
            .fmap(EpiDoc.getEditions)
            .unpackT([])
            .flatMap(TokenableT.tokens)
            .map(TEITokenFuncs.excludeTextNodesWithAncestors(["g", "orig", "am", "sic"]))  
            .map( (tokenTextNodes: Text[]) => {
                return tokenTextNodes.map( (textNode: Text) => TEITokenFuncs
                    .textWithSuppliedInBrackets(textNode))
                    .join("")
                    .replace("][", "")
                    .replace(",", "")
            } )
    
        // Create Arethusa from EpiDoc tokens
        const arethusa = ArethusaDoc
            .fromXMLStr(arethusaTemplate)
            .bind(ArethusaDoc.setDocId(docId))
            .bind(ArethusaDoc.appendSentence)
            .bind(ArethusaDoc.lastSentence)
            // .bind(ArethusaSentence.appendMaybeWords(words))
            .bind(ArethusaSentence.appendWords(tokens))
    
        // Prettify Arethusa XML
        const arethusaXML = arethusa
            .fmap(DXML.node)
            .fmap(XMLFormatter.deprettifyFromRoot(true))
            .fmap(XMLFormatter.prettifyFromRoot(true))
            .bind(ArethusaDoc.fromNode)
            .fmap(ArethusaDoc.toXMLStr)
    
        return arethusaXML
    }
}