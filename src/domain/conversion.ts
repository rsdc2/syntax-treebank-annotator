class Conversion {
    static epidocToArethusa = (epidoc: EpiDoc): Maybe<ArethusaDoc> => {
        return MaybeT.of(epidoc)
            .fmap(EpiDoc.toXMLStr)
            .bind(Conversion.epidocXMLToArethusaXML)
            .bind(ArethusaDoc.fromXMLStr)
    }

    static epidocXMLToArethusa = (epidocXML: string): Maybe<ArethusaDoc> => {
        return MaybeT.of(epidocXML)
            .bind(Conversion.epidocXMLToArethusaXML)
            .bind(ArethusaDoc.fromXMLStr)
    }


    // Main function for converting EpiDoc XML to 
    // Arethusa XML
    static epidocXMLToArethusaXML = (epidocXML: string): Maybe<string> => {

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
        
        const attrs = tokens.reduce ( (acc: IArethusaWord[], token: TEIToken): IArethusaWord[] => {
            const attr = {
                form: token.normalizedText,
                leiden: token.leidenText,
                lemma: "",
                postag: "",
                upos: "",
                feats: "",
                relation: "",
                head: "",
                secdeps: "",
                corpusId: XML.getAttrVal("http://www.w3.org/XML/1998/namespace")("id")(token).fromMaybe("")
            }

            return [...acc, attr]

        }, new Array<IArethusaWord>()             
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