
enum ElementType {
    NodeLabel = "nodeLabel",
    EdgeLabel = "edgeLabel",
    Unknown = "unknown"
}


class TreeStateIO {
    private _treeState: TreeState
    private _currentSentStateIdx: number = 0

    addSentStateFromNodes(nodes: ITreeNode[], update: boolean): void {
        const newSentState = new TreeState (
            this.currentSentStateIdx + 1,
            this.currentTreeState._sentence_id,
            [],
            nodes,
            this.currentTreeState.clickState
        )
        this.push
            (newSentState)
            (false)
            (update)
    }

    get arethusaSentence () {
        return this
            .currentTreeState
            .arethusaSentence
    }

    static changeClickState = (newClickState: ClickState) => (state: TreeStateIO) => {

        switch (newClickState.elementType) {

            case (ElementType.EdgeLabel):
                state.changeEdgeLabelClickState(newClickState)
                break

            case (ElementType.NodeLabel):
                state.clickState
                    .edgeLabelElement
                    .fmap(state.changeRelation)

                Graph.unclickAll()
                ClickState.clicked(newClickState)
                break

            case (ElementType.Unknown):
                state.currentTreeState
                    .clickState
                    .edgeLabelElement
                    .fmap(state.changeRelation)
                Graph.unclickAll()
                ClickState.clicked(newClickState)
                break
        }

        state.currentTreeState.clickState = newClickState

    }

    changeEdgeLabelClickState = (newClickState: ClickState) => {

        if (newClickState.elementType === ElementType.EdgeLabel) {

            // Don't do anything if clicking on the same label
            if ( this.currentTreeState.clickState.elementType === ElementType.EdgeLabel ) {
                if (newClickState.lastClickedId.value === this.currentTreeState.clickState.lastClickedId.value) {
                    return
                }
            }
    
            this.currentTreeState.clickState
                .edgeLabelElement
                .fmap(this.changeRelation)

            Graph.unclickAll()

            newClickState
                .labelElem
                .fmap( HTML.Elem.setAttr ("contenteditable") ("true") )

            ClickState.clicked(newClickState)
        }
    }

    changeNode = (newNode: ITreeNode) => {
        const newState = TreeStateIO.deepcopy(this.currentTreeState)

        const nodeIdx = newState._nodes?.findIndex((node) => {
            return node.treeNodeId === newNode.treeNodeId
        }
        )
        if (nodeIdx) {
            if (newState._nodes) {
                newState._nodes[nodeIdx] = newNode
            }
        }

        this.addSentStateFromNodes(newState._nodes, true)
    };


    static changeNodeValue =
        (nodeField: string) =>
        (nodeValue: string) =>
        (treeNodeId: string) =>
        (state: TreeStateIO) =>

        {

        const id = parseInt(treeNodeId)
        const nodes = state
            .currentTreeState
            .nodes

        if (nodes) {
            const node = nodes[id]
            const newNode = Obj.deepcopy(node)

            switch (nodeField) {
                case ('name'): 
                    newNode[nodeField] = nodeValue
                    break
                case ('relation'): 
                    newNode[nodeField] = nodeValue
                    break
                case ('headTreeNodeId'):
                    const tokenId = state
                        .currentTreeState
                        .treeNodeIdToTokenId(parseInt(nodeValue))

                    const setHeadTokenId = tokenId
                        .fmap(TreeNode.setHeadTokenId)

                    MaybeT.of(newNode)
                        .applyFmap(setHeadTokenId)
                    break

                default: 
                    newNode[nodeField] = parseInt(nodeValue)
            }

            state.changeNode(newNode)
        }
    }

    changeNodeValue = 
        (nodeField: string) =>
        (nodeValue: string) =>
        (treeNodeId: string) =>
        {

        TreeStateIO.changeNodeValue
            (nodeField) 
            (nodeValue) 
            (treeNodeId) 
            (this)
    }

    changeRelation = (elem: HTMLDivElement) => {
        const maybeElem = MaybeT.of(elem)
            
        const linkType = maybeElem
            .bind(HTML.Elem.getAttr("type"))
            .unpack(LinkType.Unknown)

        const newRel = maybeElem
            .bind(HTML.Div.textContent)

        switch (linkType) {
            case (LinkType.Head):

                const depIdx = HTML.Elem.getAttr 
                    ("dep-id") 
                    (elem)
                

                const currentRel = depIdx
                    .bind(this.currentTreeState.nodeByTreeNodeId)
                    .fmap(TreeNode.relation)

                const changed = !(currentRel.value === newRel.value)

                switch (changed) {
                    case (false):
                        Graph.unclickAll()
                        break
                    case (true):
                        depIdx.applyFmap(
                            newRel.fmap(
                                this.changeNodeValue("relation")))   
                        break
                }
     
                break

            case (LinkType.Slash):
                const slashId = HTML.Elem.getAttr ("slash-id") (elem)
                slashId
                    .applyFmap(newRel.fmap(this.changeSlashRel))

                break
        }

    }

    static changeSlashRel = 
        (newRel: AGLDTRel) =>
        (slashId: string) => 
        (state: TreeStateIO) => 

        {
            const currentSlash = state
                .currentTreeState
                .slashBySlashId(slashId)
            
            const currentRel = currentSlash
                .fmap(Slash.relation)

            const changed = !(currentRel.eq(newRel))

            switch (changed) {
                case (true):
                    const newSlash = currentSlash
                        .fmap(Slash.changeRel(newRel))
                        .fmap(Slash.ofI)
        
                    const getNode = state
                        .currentTreeState
                        .nodeByTreeNodeId
        
                    const parentNode = newSlash
                        .bind(Slash.depTreeNodeId(state.currentTreeState))
                        .fmap(Str.fromNum)
                        .bind(getNode)
        
                    const changeSlash = newSlash.fmap(TreeNode.changeSlash)
        
                    const newParentNode = parentNode
                        .applyFmap(changeSlash)
                        
                    newParentNode.fmap(state.changeNode)    
                    break
                
                case (false):
                    Graph.unclickAll()
                    break
            }


        }

    changeSlashRel = 
        (newRel: AGLDTRel) =>
        (slashId: string) => 
    {
        TreeStateIO.changeSlashRel
            (newRel)
            (slashId)
            (this)
    }

    get clickState () {
        return this.currentTreeState.clickState
    }

    private set clickState (value: ClickState) {
        this.currentTreeState.clickState = value
    }

    get currentSentStateIdx(): number {
        return this._currentSentStateIdx
    };

    private set currentSentStateIdx(value: number) {
        this._currentSentStateIdx = value
    };

    static currentSentStateIdx = (state: TreeStateIO) => {
        return state.currentSentStateIdx
    }

    static currentSentState = (state: TreeStateIO) => {
        return state.currentTreeState
    }

    constructor(sentState: ITreeState) {
        if (sentState._tokens.length == 0) {
            console.error("No tokens in sentence state.")
        }

        const tokensWithRoot = Arr
            .unshift(Obj.deepcopy(sentState._tokens), Constants.rootToken)
        
        const nodes = TreeNode
            .tokensToTreeNodes(tokensWithRoot)

        const newSentState = new TreeState (
            sentState._state_id,
            sentState._sentence_id,
            tokensWithRoot,
            nodes,
            sentState._clickState
        )

        this._treeState = newSentState
        this.currentSentStateIdx = 0
    };

    static deepcopy = (state: TreeState) => {
        return Obj.deepcopy(state)
    }

    get currentTreeState(): TreeState {
        return this._treeState
    }

    get lastClickedId() {
        return this
            .currentTreeState
            .clickState
            .lastClickedId
    }

    static lastClickedId = (state: TreeStateIO) => {
        return state
            .currentTreeState
            .clickState
            .lastClickedId
    }

    get lastClickType() {
        return TreeStateIO.lastClickType(this)
    }

    static lastClickType = (state: TreeStateIO): ClickType => {
        return state
            .currentTreeState
            .clickState
            ._clickType
    }

    get lastSentStateIdx() {
        return 0
    }

    static newSlashRel =
        (newRel: string) =>
        (headTreeNodeId: number) =>
        (depTreeNodeId: number) => 
        (state: TreeStateIO) => 

        {
            const slash = Slash.ofTreeNodeIds (state.currentTreeState) (headTreeNodeId) (depTreeNodeId) (newRel)

            state
                .currentTreeState
                .nodeByTreeNodeId(Str.fromNum(depTreeNodeId))
                .applyFmap(slash.fmap(TreeNode.appendSlash))
                .fmap(state.changeNode)
        }

    newSlashRel = 
        (newRel: string) =>
        (headTokenIdx: number) =>
        (depTokenIdx: number) => 
        {
            return TreeStateIO 
                .newSlashRel
                    (newRel)
                    (headTokenIdx)
                    (depTokenIdx)
                    (this)
        }

    get nodes () {
        return this.currentTreeState.nodes
    }

    static nodes = (state: TreeStateIO) => {
        return state.currentTreeState.nodes
    } 

    static of = (sentState: TreeState) => {
        return new TreeStateIO(sentState)
    }

    push = (ts: TreeState) => (ext: boolean) => (update: boolean) => {
        TreeStateIO.push(ext)(update)(ts)(this)
    }
    
    static push = (ext: boolean) => (updateGraph: boolean) => (ts: TreeState) =>  (treeStateIO: TreeStateIO) => {

        treeStateIO._treeState = ts
        treeStateIO.currentSentStateIdx = 0
        // console.log(ts.clickState)

        if (updateGraph) {
            Graph.updateSimulation_(treeStateIO._treeState)
        }

        const changeArethusaSentence = globalState
            .textStateIO
            .fmap(TextStateIO.changeArethusaSentence(true))

        if (!ext) {
            treeStateIO
                .arethusaSentence
                .applyFmap(changeArethusaSentence)
        }

    }

    redo = () => {
        TreeStateIO.redo(this)
    }

    static redo = (state: TreeStateIO) => {
        Graph.unclickEdgeLabels()

        if (state.currentSentStateIdx >= state.lastSentStateIdx) {
            state.currentSentStateIdx = state.lastSentStateIdx
            return
        }
        state.currentSentStateIdx += 1

        Graph.updateSimulation(state)
        TreeStateIO.updateFrontendClickState(state)
    }

    static removeSlashBySlashIdFromTreeNodeIds = (slashId: string) => (state: TreeStateIO) => {
        const node = state
            .currentTreeState
            .nodeBySlashIdFromTreeNodeIds (slashId)
            .fmap(TreeNode.removeSlashBySlashIdFromTreeNodeIds(state.currentTreeState) (slashId))

        node.fmap(state.changeNode)
    }

    removeSlashBySlashIdFromTreeNodeIds = (slashId: string) => {
        TreeStateIO.removeSlashBySlashIdFromTreeNodeIds (slashId) (this)
    }

    replace = (state: TreeState, update: boolean, sentStateToReplaceIdx: number) => {
        this._treeState = state

        if (update) {
            Graph.updateSimulation_(this._treeState)
        }
    }

    replaceSentStateFromNodes(nodes: ITreeNode[], update: boolean, idx: number): void {
        const newSentState = new TreeState (
            this.currentSentStateIdx + 1,
            this.currentTreeState._sentence_id,
            [],
            nodes,
            this.currentTreeState.clickState
        )
        this.replace(newSentState, update, idx)
    }

    static replaceSentStateFromNodes= (nodes: ITreeNode[], update: boolean, idx: number) => (state: TreeStateIO): void  => {
        const newSentState = new TreeState (
            state.currentSentStateIdx + 1,
            state.currentTreeState._sentence_id,
            [],
            nodes,
            state.currentTreeState.clickState
        )
        state.replace(newSentState, update, idx)
    }

    get slashes() {
        return this.currentTreeState.slashes
    }

    static currentStateId = (state: TreeStateIO) => {
        return state.currentTreeState._state_id
    }

    undo = () => {
        TreeStateIO.undo(this)
    }

    static undo = (state: TreeStateIO) => {
        Graph.unclickEdgeLabels()

        if (state.currentSentStateIdx <= 0) {
            state.currentSentStateIdx = 0
            return
        }

        state.currentSentStateIdx -= 1

        Graph.updateSimulation(state)
        TreeStateIO.updateFrontendClickState(state)
    }

    static updateFrontendClickState = (state: TreeStateIO) => {
        Graph.unclickAll()

        if (state.lastClickedId.isNothing) return

        switch (state.currentTreeState.clickState.elementType) {
            case (ElementType.NodeLabel):
                this.changeClickState( ClickState.none() )
                break
            
            case (ElementType.EdgeLabel):
                this.changeClickState( ClickState.none() )
                break
                
        }

    }

    get xmlNode () {
        return this.currentTreeState.xmlNode
    }
}