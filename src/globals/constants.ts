
namespace Constants {

    export const rootNode: ITreeNode = {
        name: "&ltROOT&gt",
        arethusaTokenId: 0,
        treeNodeId: 0,
        headTokenId: -1,
        relation: AGLDTRel.NONE,
        lemma: "",
        feats: "",
        postag: "",
        secondaryDeps: [],
        distToRoot: 0, 
        type: NodeType.Root,
        insertionId: "",
        artificialType: ArtificialType.None
    }

    export const rootToken: ITreeWord = {
        form: "&ltROOT&gt",
        headId: -1,
        id: 0,
        lemma: "",
        postag: "",
        feats: "",
        relation: AGLDTRel.NONE,
        type: TreeTokenType.Root,
        secondaryDeps: []
    }

    export const defaultRel = "rel"

    export const defaultViewBox = "0 0 560 560"

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