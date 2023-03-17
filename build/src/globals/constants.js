var Constants;
(function (Constants) {
    Constants.rootNode = {
        name: "ROOT",
        tokenId: 0,
        treeNodeId: 0,
        headTokenId: -1,
        relation: AGLDTRel.NONE,
        slashes: [],
        distToRoot: 0,
        type: NodeType.Root,
        // token: null,
    };
    Constants.rootToken = {
        form: "[ROOT]",
        headId: -1,
        id: 0,
        lemma: "",
        postag: "",
        relation: AGLDTRel.NONE,
        type: TokenType.Root,
        slashes: []
    };
    Constants.defaultRel = "rel";
    // const tabSeparator = "\t"
})(Constants || (Constants = {}));
