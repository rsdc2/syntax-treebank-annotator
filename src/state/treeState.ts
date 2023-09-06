/**
 * Holds all information pertinent to a given tree representation.
 */

class TreeState implements ITreeState {
    _state_id: number
    _sentence_id: string
    _tokens: ITreeToken[]
    _nodes: ITreeNode[]
    _clickState: ClickState = ClickState.of
        (Nothing.of())
        (TreeLabelType.Unknown)
        (ClickType.Unknown)

    constructor(
        state_id: number,
        sentence_id: string,
        tokens: ITreeToken[],
        nodes: ITreeNode[],
        clickState: ClickState,
    ) {
        this._state_id = state_id
        this._sentence_id = sentence_id
        this._tokens = tokens
        this._nodes = nodes
        this._clickState = clickState
    }

    get arethusaSentence () {
        return TreeState   
            .arethusaSentence(this)
    }

    static arethusaSentence = (s: TreeState) => {
        return TreeState
            .toArethusaXMLNode(s) 
            .fmap(ArethusaSentence.fromXMLNode)
    }

    get clickState() {
        return this._clickState
    }

    set clickState(value: ClickState) {
        this._clickState = value
    }

    static setClickState = (value: ClickState) => (treeState: TreeState) => {
        treeState.clickState = value
    }

    static deepcopy = (t: TreeState) => {
        return TreeState.of
            (t._state_id)
            (t._sentence_id)
            (Obj.deepcopy(t._tokens))
            (Obj.deepcopy(t._nodes))
            (ClickState.of
                (t._clickState._lastClickedTreeNodeId)
                (t._clickState._elementType)
                (t._clickState._clickType)
            )
    }

    get id() {
        return this._state_id
    }

    set id(value: number) {
        this._state_id = value
    }

    static nodeByTokenId = 
        (tokenId: string) => 
        (sentState: TreeState) => 
    {
        return TreeNode.nodeByTokenId(tokenId) (sentState.nodes)
    }

    static nodeByTreeNodeId = 
        (treeNodeId: string) => 
        (sentState: TreeState) => 
    {
        return MaybeT.of(
            sentState
                .nodes
                .find(
                    (node: ITreeNode) => 
                        node.treeNodeId === parseInt(treeNodeId))
            )
    }

    nodeByTokenId = (depIdx: string) => {
        return TreeState.nodeByTokenId (depIdx) (this)
    }

    nodeByTreeNodeId = (depIdx: string) => {
        return TreeState.nodeByTreeNodeId (depIdx) (this)
    }

    static nodeBySlashIdFromTreeNodeIds = 
        (slashId: string) => 
        (sentState: TreeState) => 
    {
        return MaybeT.of(
            sentState
                .slashes
                .find(
                    (islash: ISecondaryDep) => {
                        return SecondaryDep
                            .ofInterface(islash)
                            .slashIdFromTreeNodeIds(sentState)
                            .eq(slashId)
                    }
                )
            )

            .bind(SecondaryDep.depTreeNodeId(sentState))
            .fmap(Str.fromNum)
            .bind(sentState.nodeByTreeNodeId)
    }

    nodeBySlashIdFromTreeNodeIds = (slashId: string) => {
        return TreeState
            .nodeBySlashIdFromTreeNodeIds
                (slashId)
                (this)
    }

    static nodeRelation = 
        (depIdx: string) => 
        (sentState: TreeState): Maybe<string> => 
    {
        return TreeState
            .nodeByTreeNodeId(depIdx)(sentState)
            .fmap(TreeNode.relation)
    }

    get nodes() {
        return this._nodes
    }

    get nodesNoRoot() {
        return this
            ._nodes
            .filter((node: ITreeNode) => node.type !== NodeType.Root)
    }

    set nodes(value: ITreeNode[]) {
        this._nodes = value
    }

    static of = 
        (stateId: number) =>
        (sentenceId: string) =>
        (tokens: ITreeToken[]) =>
        (nodes: ITreeNode[]) =>
        (clickState: ClickState) => 
    {

            return new TreeState(
                stateId, 
                sentenceId, 
                tokens, 
                nodes, 
                clickState
            )
        }

    static ofTokens = 
        (sentence_id: string) =>
        (tokens: ITreeToken[]) => 
    {
        const nodes = tokens
            .map(TreeNode.tokenToTreeNode)

        return new TreeState(
            globalState
                .treeStateIO
                .fmap(TreeStateIO.currentStateId)
                .fmap(Num.add(1))
                .fromMaybe(0), 
            sentence_id, 
            tokens, 
            nodes, 
            ClickState.none()
        )
    }

    static ofTokensWithExistingNodes = 
        (nodes: ITreeNode[]) => 
        (sentence_id: string) =>
        (tokens: ITreeToken[]) => 
    {
        const tokensWithRoot = Arr
            .unshift(
                Obj.deepcopy(tokens), Constants.rootToken
            )
        const _nodes = tokensWithRoot
            .map(
                TreeNode.tokenToTreeNodeFromExistingNode(nodes)
            )
        
        return new TreeState(
            globalState
                .treeStateIO
                .fmap(TreeStateIO.currentStateId)
                .fmap(Num.add(1))
                .fromMaybe(0),
            sentence_id, 
            tokens, 
            _nodes, 
            ClickState.none()
        )
    }

    get slashes ()  {
        return this.nodes
            .reduce ( (acc: SecondaryDep[], node:ITreeNode) => {
                return Arr.concat
                    (acc)
                    (node   
                        .secondaryDeps
                        .map(SecondaryDep.ofInterface)
                    )
            }
            , [])
    }

    slashBySlashId = (slashId: string) => {
        return MaybeT.of(this
            .slashes
            .find (
                (slash: ISecondaryDep) => {
                    return SecondaryDep
                        .ofInterface(slash)
                        .slashIdFromTokenIds === slashId
                }
            ))
    }

    get tokens() {
        return this._tokens
    }

    set tokens (value: ITreeToken[]) {
        this._tokens = value
    }

    static tokenIdToTreeNodeId = 
        (tokenId: number) => 
        (treeState: TreeState) => 
    {
        return treeState
            .nodeByTokenId(Str.fromNum(tokenId))
            .fmap(TreeNode.treeNodeId)
    }

    tokenIdToTreeNodeId = (tokenId: number) => {
        return TreeState.tokenIdToTreeNodeId
            (tokenId)
            (this)
    }

    static toArethusaSentenceXMLStr = (s: TreeState) => {
        const xmlWords = s
            .nodesNoRoot
            .map(TreeNode.toArethusaWordXMLStr)

        return `<sentence id="${s._sentence_id}">`
            .concat(...xmlWords)
            .concat(`</sentence>`)
    }

    static toArethusaXMLNode = (s: TreeState) => {
        return MaybeT.of(XML
            .fromXMLStr(TreeState.toArethusaSentenceXMLStr(s))
            .firstChild)
    }

    static treeNodeIdToTokenId = 
        (treeNodeId: number) => 
        (sentState: TreeState) => 
    {
        return sentState
            .nodeByTreeNodeId(Str.fromNum(treeNodeId))
            .fmap(TreeNode.tokenId)
    }

    treeNodeIdToTokenId = (treeNodeId: number) => {
        return TreeState.treeNodeIdToTokenId(treeNodeId)(this)
    }

    get xmlNode () {
        return TreeState.toArethusaXMLNode(this)
    }

}
