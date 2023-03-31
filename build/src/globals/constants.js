var Constants;
(function (Constants) {
    Constants.rootNode = {
        name: "ROOT",
        arethusaTokenId: 0,
        treeNodeId: 0,
        headTokenId: -1,
        relation: AGLDTRel.NONE,
        secondaryDeps: [],
        distToRoot: 0,
        type: NodeType.Root,
        artificialType: ArtificialType.None
    };
    Constants.rootToken = {
        form: "[ROOT]",
        headId: -1,
        id: 0,
        lemma: "",
        postag: "",
        relation: AGLDTRel.NONE,
        type: TreeTokenType.Root,
        secondaryDeps: []
    };
    Constants.defaultRel = "rel";
    Constants.messages = {
        about: String.raw `<p>
                The Treebank Annotator was written by Robert Crellin as part of the
                Crossreads project at the Faculty of Classics, University of Oxford, and
                is licensed under the MIT license. This project has received funding
                from the European Research Council (ERC) under the European Union's
                Horizon 2020 research and innovation programme (grant agreement No
                885040, "Crossreads").
            </p>`
    };
})(Constants || (Constants = {}));
