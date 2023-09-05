class Conversion {
}
Conversion.epidocToArethusa = (epidoc) => {
    return MaybeT.of(epidoc)
        .fmap(EpiDoc.toXMLStr)
        .bind(Conversion.epidocXMLToArethusaXML)
        .bind(ArethusaDoc.fromXMLStr);
};
Conversion.epidocXMLToArethusa = (epidocXML) => {
    return MaybeT.of(epidocXML)
        .bind(Conversion.epidocXMLToArethusaXML)
        .bind(ArethusaDoc.fromXMLStr);
};
Conversion.epidocXMLToArethusaXML = (epidocXML) => {
    const epidoc = MaybeT.of(XML.fromXMLStr(epidocXML))
        .fmap(XMLFormatter.deprettifyFromRoot(true))
        .fmap(XML.toStr)
        .bind(EpiDoc.fromXMLStr);
    const docId = epidoc
        .bind(EpiDoc.filenameId)
        .unpackT("");
    const tokens = epidoc
        .fmap(EpiDoc.getEditions)
        .unpackT([])
        .flatMap(HasTokensT.tokens);
    const tokenStrings = tokens
        .map(TEITokenFuncs.excludeTextNodesWithAncestors(["g", "orig", "am", "sic"]))
        .map((tokenTextNodes) => {
        return tokenTextNodes.map((textNode) => TEITokenFuncs
            .textWithSuppliedInBrackets(textNode))
            .join("")
            .replace("][", "")
            .replace(",", "");
    });
    const ids = tokens.
    ;
    // Create Arethusa from EpiDoc tokens
    const arethusa = ArethusaDoc
        .fromXMLStr(arethusaTemplate)
        .bind(ArethusaDoc.setDocId(docId))
        .bind(ArethusaDoc.appendSentence)
        .bind(ArethusaDoc.lastSentence)
        .bind(ArethusaSentence.appendWords(tokens));
    // Prettify Arethusa XML
    const arethusaXML = arethusa
        .fmap(DXML.node)
        .fmap(XMLFormatter.deprettifyFromRoot(true))
        .fmap(XMLFormatter.prettifyFromRoot(true))
        .bind(ArethusaDoc.fromNode)
        .fmap(ArethusaDoc.toXMLStr);
    return arethusaXML;
};
// This is the old version of the function
Conversion.epidocXMLToArethusaXML_ = (epidocXML) => {
    const epidoc = MaybeT.of(XML.fromXMLStr(epidocXML))
        .fmap(XMLFormatter.deprettifyFromRoot(true))
        .fmap(XML.toStr)
        .bind(EpiDoc.fromXMLStr);
    const docId = epidoc
        .bind(EpiDoc.filenameId)
        .unpackT("");
    const tokens = epidoc
        .fmap(EpiDoc.getEditions)
        .unpackT([])
        .flatMap(HasTokensT.tokens)
        .map(TEITokenFuncs.excludeTextNodesWithAncestors(["g", "orig", "am", "sic"]))
        .map((tokenTextNodes) => {
        return tokenTextNodes.map((textNode) => TEITokenFuncs
            .textWithSuppliedInBrackets(textNode))
            .join("")
            .replace("][", "")
            .replace(",", "");
    });
    // Create Arethusa from EpiDoc tokens
    const arethusa = ArethusaDoc
        .fromXMLStr(arethusaTemplate)
        .bind(ArethusaDoc.setDocId(docId))
        .bind(ArethusaDoc.appendSentence)
        .bind(ArethusaDoc.lastSentence)
        // .bind(ArethusaSentence.appendMaybeWords(words))
        .bind(ArethusaSentence.appendWords(tokens));
    // Prettify Arethusa XML
    const arethusaXML = arethusa
        .fmap(DXML.node)
        .fmap(XMLFormatter.deprettifyFromRoot(true))
        .fmap(XMLFormatter.prettifyFromRoot(true))
        .bind(ArethusaDoc.fromNode)
        .fmap(ArethusaDoc.toXMLStr);
    return arethusaXML;
};
