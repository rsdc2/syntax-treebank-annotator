class XMLFormatter {
    static deprettifyFromRoot = (deepcopy) => (node) => {
        const _node = deepcopy ? XML.deepcopy(node.getRootNode()) : node.getRootNode();
        XML.descendantTextNodes(_node)
            .fromMaybe([])
            .filter(XMLFormatter.notInXMLSpacePreserve)
            .map(XML.replaceText(/\s{2}/g)("\t"))
            .map(XML.replaceText(/[\n\t]/g)(""))
            .map(XML.stripText);
        return _node;
    };
    static inXMLSpacePreserve(node) {
        const parents = XML.parents(node)
            .filter(XML.hasAttrVal("xml:space")("preserve"));
        return parents.length > 0;
    }
    static notInXMLSpacePreserve(node) {
        return !XMLFormatter.inXMLSpacePreserve(node);
    }
    static prettifyFromRoot(deepcopy) {
        function _prettifyFromRoot(node1) {
            function _prettifyDescendants(node2) {
                const depth = XML.depth(node2);
                if (depth === 0)
                    return node2;
                if (XMLFormatter.inXMLSpacePreserve(node2))
                    return node2;
                const maybeNode = MaybeT.of(node2);
                const newline = XML.createTextElementFromNode("\n")(node2);
                const insertNewlineBefore = newline.fmap(XML.insertBefore);
                const insertNewlineAfter = newline.fmap(XML.insertAfter);
                const preTabstring = tabSeparator.repeat(depth);
                const preTabs = XML.createTextElementFromNode(preTabstring)(node2);
                const insertTabsBefore = preTabs.fmap(XML.insertBefore);
                const postTabstring = tabSeparator.repeat(depth - 1);
                const postTabs = XML.createTextElementFromNode(postTabstring)(node2);
                const insertTabsAfter = postTabs.fmap(XML.insertAfter);
                maybeNode.applyBind(insertNewlineBefore);
                maybeNode.applyBind(insertTabsBefore);
                if (XML.nextSiblingElements(node2).fromMaybe([]).length === 0) {
                    maybeNode.applyBind(insertTabsAfter);
                    maybeNode.applyBind(insertNewlineAfter);
                }
                return node2;
            }
            // Depth calculation only seems to work if start at root node
            const _node = XMLFormatter.deprettifyFromRoot(deepcopy)(node1.getRootNode());
            const descs = XML
                .descendantsOrSelf(_node)
                .unpack([])
                .map(_prettifyDescendants);
            return _node;
        }
        return _prettifyFromRoot;
    }
}
