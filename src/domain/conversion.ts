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
            .fromMaybe("")

        const tokens = epidoc
            .fmap(EpiDoc.getEditions)
            .fromMaybe([])
            .flatMap(Edition.getTokens)

        const attrs = tokens.map ( (token): IArethusaWord => {
            return {
                form: token.text.fromMaybe(""),
                lemma: "",
                postag: "",
                relation: "",
                head: "",
                secdeps: "",
                xmlid: XML.getAttrVal("http://www.tei-c.org/ns/1.0")("id")(token)
            }
        } 
            
        )
    
        // Create Arethusa from EpiDoc tokens
        const arethusa = ArethusaDoc
            .fromXMLStr(arethusaTemplate)
            .bind(ArethusaDoc.setDocId(docId))
            .bind(ArethusaDoc.appendSentence)
            .bind(ArethusaDoc.lastSentence)
            .bind(ArethusaSentence.appendWordAttrs(attrs))
            
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