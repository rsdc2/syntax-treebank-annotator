var Constants;
(function (Constants) {
    Constants.rootNode = {
        name: "[ROOT]",
        arethusaTokenId: 0,
        treeNodeId: 0,
        headTokenId: -1,
        relation: AGLDTRel.NONE,
        leiden: "",
        lemma: "",
        feats: "",
        postag: "",
        upos: "",
        secondaryDeps: [],
        distToRoot: 0,
        type: NodeType.Root,
        insertionId: "",
        artificialType: ArtificialType.None
    };
    Constants.rootToken = {
        form: "[ROOT]",
        leiden: "",
        headId: -1,
        id: 0,
        lemma: "",
        postag: "",
        upos: "",
        feats: "",
        relation: AGLDTRel.NONE,
        type: TreeTokenType.Root,
        secondaryDeps: []
    };
    Constants.defaultRel = "rel";
    Constants.defaultViewBox = "0 0 560 560";
    /**
     * TODO MAXTOKENS per SENTENCE
     */
    Constants.MAXSENTENCES = 2000;
    Constants.MAXTOKENS = 800;
    Constants.MAXTOKENSPERSENTENCE = 270;
    /**
     * Maximum file size in KB
     * TODO: split this into Arethusa and EpiDoc
     */
    Constants.MAXFILESIZE = 50;
    Constants.messages = {
        about: String.raw `The Treebank Annotator was written by Robert Crellin as part of the
                Crossreads project at the Faculty of Classics, University of Oxford, and
                is licensed under the MIT license 
                (https://github.com/rsdc2/syntax-treebank-annotator/blob/main/LICENSE). 
                This project has received funding
                from the European Research Council (ERC) under the European Union's
                Horizon 2020 research and innovation programme (grant agreement No
                885040, "Crossreads").`
    };
})(Constants || (Constants = {}));
