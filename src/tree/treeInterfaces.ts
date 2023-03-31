interface ISecondaryDep {
    _headTokenId: number
    _depTokenId: number
    _relation: string
}

/**
 * Has direct relationship to tokens in Arethusa XML
 */

interface ITreeToken {
    form: string,
    headId: number,
    id: number,
    relation: string,
    type: TreeTokenType,
    secondaryDeps: ISecondaryDep[]
}

interface ITreeWord extends ITreeToken {
    lemma: string,
    postag: string,
}

interface ITreeArtificial extends ITreeToken {
    insertion_id: string,
    artificial: string
}

/**
 * Nodes in the tree
 * Includes the ROOT
 */
interface ITreeNode extends d3.SimulationNodeDatum {
    name: string,
    arethusaTokenId: number,
    treeNodeId: number,
    headTokenId: number,
    secondaryDeps: ISecondaryDep[],   // a secondary dep is stored on the dependent node
    distToRoot: number,
    relation: string
    type: NodeType,
    artificialType: ArtificialType,
    radius?: number | undefined;
}


interface ITreeLink {
    id: string,
    source: ITreeNode,
    target: ITreeNode,
    type: LinkType,
    relation: string,
    headTreeNodeId: number,
    depTreeNodeId: number
}

interface ITreebank {
    direction: TextDir,
    format: FileFormat,
    formalism: Formalism,
    xmlLang: XMLLang,
    textId: string,
    annotator: string,
    sentences: ITreeState[]
}
