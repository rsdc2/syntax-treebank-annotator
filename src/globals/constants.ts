
namespace Constants {

    export const rootNode: ITreeNode = {
        name: "ROOT",
        arethusaTokenId: 0,
        treeNodeId: 0,
        headTokenId: -1,
        relation: AGLDTRel.NONE,
        secondaryDeps: [],
        distToRoot: 0, 
        type: NodeType.Root,
        // token: null,
    }

    export const rootToken: ITreeToken = {
        form: "[ROOT]",
        headId: -1,
        id: 0,
        lemma: "",
        postag: "",
        relation: AGLDTRel.NONE,
        type: TreeTokenType.Root,
        secondaryDeps: []
    }

    export const defaultRel = "rel"

    export const messages = {
        about: String.raw
            `<p>
                The Treebank Annotator was written by Robert Crellin as part of the
                Crossreads project at the Faculty of Classics, University of Oxford, and
                is licensed under the MIT license. This project has received funding
                from the European Research Council (ERC) under the European Union's
                Horizon 2020 research and innovation programme (grant agreement No
                885040, "Crossreads").
            </p>`
            
    }

}