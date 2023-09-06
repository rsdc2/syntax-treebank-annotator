interface ISecondaryDep {
    _headTokenId: number
    _depTokenId: number
    _relation: string
}

/**
 * Has direct relationship to tokens in Arethusa XML
 */
interface ITreeWord {
    form: string,
    headId: number,
    id: number,
    relation: string,
    type: TreeTokenType,
    secondaryDeps: ISecondaryDep[]
    lemma: string,
    postag: string,
    xmlid?: string
}

interface ITreeArtificial {
    form: string,
    headId: number,
    id: number,
    relation: string,
    type: TreeTokenType,
    secondaryDeps: ISecondaryDep[]
    insertionId: string,
    artificial: string,
    xmlid?: string
}

type ITreeToken = ITreeWord | ITreeArtificial

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
    relation: string,
    lemma: string,
    postag: string,
    type: NodeType,
    insertionId: string,
    artificialType: ArtificialType,
    radius?: number | undefined;
    xmlid?: string,
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

interface ITreeState {
    _state_id: number,
    _sentence_id: string,
    _tokens: ITreeToken[],
    _nodes: ITreeNode[]
    _clickState: ClickState
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

