
namespace Constants {

    export const rootNode: ITreeNode = {
        name: "ROOT",
        tokenId: 0,
        treeNodeId: 0,
        headTokenId: -1,
        relation: AGLDTRel.NONE,
        slashes: [],
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
        type: TokenType.Root,
        slashes: []
    }

    export const defaultRel = "rel"

}