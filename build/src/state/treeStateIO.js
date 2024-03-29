/**
 * Responsible for IO to the tree representation.
 */
class TreeStateIO {
    _treeState;
    _currentSentStateIdx = 0;
    addSentStateFromNodes(nodes, update) {
        const newSentState = new TreeState(this.currentSentStateIdx + 1, this.currentTreeState._sentence_id, this.currentTreeState._lang, this.currentTreeState._notes, [], nodes, this.currentTreeState.clickState);
        this.push(newSentState)(false)(update);
    }
    get arethusaSentence() {
        return this
            .currentTreeState
            .arethusaSentence;
    }
    static changeClickState = (newClickState) => (state) => {
        switch (newClickState.elementType) {
            case (TreeLabelType.EdgeLabel):
                state.changeEdgeLabelClickState(newClickState);
                break;
            case (TreeLabelType.NodeLabel):
                state
                    .clickState
                    .edgeLabelElement
                    .fmap(state.changeRelation);
                Graph.unclickAll();
                ClickState.clicked(newClickState);
                break;
            case (TreeLabelType.Unknown):
                state.currentTreeState
                    .clickState
                    .edgeLabelElement
                    .fmap(state.changeRelation);
                Graph.unclickAll();
                ClickState.clicked(newClickState);
                break;
        }
        state.currentTreeState.clickState = newClickState;
    };
    changeEdgeLabelClickState = (newClickState) => {
        if (newClickState.elementType === TreeLabelType.EdgeLabel) {
            // Don't do anything if clicking on the same label
            if (this.currentTreeState.clickState.elementType ===
                TreeLabelType.EdgeLabel) {
                if (newClickState.lastClickedId.value ===
                    this.currentTreeState.clickState.lastClickedId.value) {
                    return;
                }
            }
            this.currentTreeState.clickState
                .edgeLabelElement
                .fmap(this.changeRelation);
            Graph.unclickAll();
            newClickState
                .currentClickedLabelElem
                .fmap(HTML.Elem.setAttr("contenteditable")("true"));
            ClickState.clicked(newClickState);
        }
    };
    changeNode = (newNode) => {
        const newState = TreeStateIO.deepcopy(this.currentTreeState);
        const nodeIdx = newState._nodes?.findIndex((node) => {
            return node.treeNodeId === newNode.treeNodeId;
        });
        if (nodeIdx) {
            if (newState._nodes) {
                newState._nodes[nodeIdx] = newNode;
            }
        }
        this.addSentStateFromNodes(newState._nodes, true);
    };
    static changeNodeValue = (nodeField) => (nodeValue) => (treeNodeId) => (state) => {
        const id = parseInt(treeNodeId);
        const nodes = state
            .currentTreeState
            .nodes;
        if (nodes) {
            const node = nodes[id];
            const newNode = Obj.deepcopy(node);
            switch (nodeField) {
                case ('name'):
                    newNode[nodeField] = nodeValue;
                    break;
                case ('relation'):
                    newNode[nodeField] = nodeValue;
                    break;
                case ('headTreeNodeId'):
                    const tokenId = state
                        .currentTreeState
                        .treeNodeIdToTokenId(parseInt(nodeValue));
                    const setHeadTokenId = tokenId
                        .fmap(TreeNode.setHeadTokenId);
                    MaybeT.of(newNode)
                        .applyFmap(setHeadTokenId);
                    break;
                default:
                    newNode[nodeField] = parseInt(nodeValue);
            }
            state.changeNode(newNode);
        }
    };
    changeNodeValue = (nodeField) => (nodeValue) => (treeNodeId) => {
        TreeStateIO.changeNodeValue(nodeField)(nodeValue)(treeNodeId)(this);
    };
    changeRelation = (elem) => {
        const maybeElem = MaybeT.of(elem);
        const linkType = maybeElem
            .bind(HTML.Elem.getAttr("type"))
            .unpack(LinkType.Unknown);
        const newRel = maybeElem
            .bind(HTML.Div.textContent);
        switch (linkType) {
            case (LinkType.Head):
                const depIdx = HTML.Elem.getAttr("dep-id")(elem);
                const currentRel = depIdx
                    .bind(this.currentTreeState.nodeByTreeNodeId)
                    .fmap(TreeNode.relation);
                const changed = !(currentRel.value === newRel.value);
                switch (changed) {
                    case (false):
                        Graph.unclickAll();
                        break;
                    case (true):
                        const x = depIdx.applyFmap(newRel.fmap(TreeStateIO.changeNodeValue("relation")));
                        const y = MaybeT.of(this).applyFmap(x);
                        break;
                }
                break;
            case (LinkType.Slash):
                const slashId = HTML.Elem.getAttr("slash-id")(elem);
                const f = newRel.fmap(TreeStateIO.changeSlashRel);
                const x = slashId.applyFmap(f);
                const y = MaybeT.of(this).applyFmap(x);
                break;
        }
    };
    static changeSlashRel = (newRel) => (slashId) => (state) => {
        const currentSlash = state
            .currentTreeState
            .slashBySlashId(slashId);
        const currentRel = currentSlash
            .fmap(SecondaryDep.relation);
        const changed = !(currentRel.eq(newRel));
        switch (changed) {
            case (true):
                const newSlash = currentSlash
                    .fmapErr(`Could not find current slash (looking for Id ${slashId}).`, SecondaryDep.changeRel(newRel))
                    .fmap(SecondaryDep.ofInterface);
                const getNode = state
                    .currentTreeState
                    .nodeByTreeNodeId;
                const parentNode = newSlash
                    .bind(SecondaryDep.depTreeNodeId(state.currentTreeState))
                    .fmap(Str.fromNum)
                    .bind(getNode);
                const changeSlash = newSlash.fmap(TreeNode.changeSlash);
                const newParentNode = parentNode.applyFmap(changeSlash);
                // This is where the node gets changed in the overall state
                newParentNode.fmap(state.changeNode);
                break;
            case (false):
                Graph.unclickAll();
                break;
        }
    };
    changeSlashRel = (newRel) => (slashId) => {
        TreeStateIO.changeSlashRel(newRel)(slashId)(this);
    };
    get clickState() {
        return this.currentTreeState.clickState;
    }
    set clickState(value) {
        this.currentTreeState.clickState = value;
    }
    static currentStateId = (state) => {
        return state.currentTreeState._state_id;
    };
    get currentSentStateIdx() {
        return this._currentSentStateIdx;
    }
    ;
    set currentSentStateIdx(value) {
        this._currentSentStateIdx = value;
    }
    ;
    static currentSentStateIdx = (state) => {
        return state.currentSentStateIdx;
    };
    static currentSentState = (state) => {
        return state.currentTreeState;
    };
    constructor(sentState) {
        if (sentState._tokens.length == 0) {
            console.error("No tokens in sentence state.");
        }
        const tokensWithRoot = Arr
            .unshift(Obj.deepcopy(sentState._tokens), Constants.rootToken);
        const nodes = TreeNode
            .tokensToTreeNodes(tokensWithRoot);
        const newSentState = new TreeState(sentState._state_id, sentState._sentence_id, sentState._lang, sentState._notes, tokensWithRoot, nodes, sentState._clickState);
        this._treeState = newSentState;
        this.currentSentStateIdx = 0;
    }
    ;
    static deepcopy = (state) => {
        return Obj.deepcopy(state);
    };
    get currentTreeState() {
        return this._treeState;
    }
    get lastClickedId() {
        return this
            .currentTreeState
            .clickState
            .lastClickedId;
    }
    static lastClickedId = (state) => {
        return state
            .currentTreeState
            .clickState
            .lastClickedId;
    };
    get lastClickType() {
        return TreeStateIO.lastClickType(this);
    }
    static lastClickType = (state) => {
        return state
            .currentTreeState
            .clickState
            ._clickType;
    };
    get lastSentStateIdx() {
        return 0;
    }
    static moveGraph = (moveFunc) => {
        Graph
            .svg()
            .fmap(moveFunc);
        const newViewBoxStr = Graph
            .svg()
            .bind(SVG.ViewBox.getViewBoxStr)
            .fromMaybe("");
        const x = globalState
            .textStateIO
            .bindErr("Error", TextStateIO
            .setCurrentSentenceViewBoxStr(newViewBoxStr));
    };
    static newSlashRel = (newRel) => (headTreeNodeId) => (depTreeNodeId) => (state) => {
        const slash = SecondaryDep.ofTreeNodeIds(state.currentTreeState)(headTreeNodeId)(depTreeNodeId)(newRel);
        state
            .currentTreeState
            .nodeByTreeNodeId(Str.fromNum(depTreeNodeId))
            .applyFmap(slash.fmap(TreeNode.appendSecondaryDep))
            .fmap(state.changeNode);
    };
    newSlashRel = (newRel) => (headTokenIdx) => (depTokenIdx) => {
        return TreeStateIO
            .newSlashRel(newRel)(headTokenIdx)(depTokenIdx)(this);
    };
    get nodes() {
        return this.currentTreeState.nodes;
    }
    static nodes = (state) => {
        return state.currentTreeState.nodes;
    };
    static of = (sentState) => {
        return new TreeStateIO(sentState);
    };
    push = (ts) => (ext) => (update) => {
        TreeStateIO.push(ext)(update)(ts)(this);
    };
    static push = (ext) => (updateGraph) => (ts) => (treeStateIO) => {
        treeStateIO._treeState = ts;
        treeStateIO.currentSentStateIdx = 0;
        if (updateGraph) {
            Graph.updateSimulation(treeStateIO);
        }
        const changeArethusaSentence = globalState
            .textStateIO
            .fmap(TextStateIO.changeArethusaSentence(true));
        if (!ext) {
            treeStateIO
                .arethusaSentence
                .applyFmap(changeArethusaSentence);
        }
    };
    redo = () => {
        TreeStateIO.redo(this);
    };
    static redo = (state) => {
        Graph.unclickEdgeLabels();
        if (state.currentSentStateIdx >= state.lastSentStateIdx) {
            state.currentSentStateIdx = state.lastSentStateIdx;
            return;
        }
        state.currentSentStateIdx += 1;
        Graph.updateSimulation(state);
        TreeStateIO.updateFrontendClickState(state);
    };
    static removeSlashBySlashIdFromTreeNodeIds = (slashId) => (state) => {
        const node = state
            .currentTreeState
            .nodeBySlashIdFromTreeNodeIds(slashId)
            .fmap(TreeNode.removeSlashBySlashIdFromTreeNodeIds(state.currentTreeState)(slashId));
        node.fmap(state.changeNode);
    };
    removeSlashBySlashIdFromTreeNodeIds = (slashId) => {
        TreeStateIO.removeSlashBySlashIdFromTreeNodeIds(slashId)(this);
    };
    replace = (state, update, sentStateToReplaceIdx) => {
        this._treeState = state;
        if (update) {
            Graph.updateSimulation(this);
        }
    };
    replaceSentStateFromNodes(nodes, update, idx) {
        const newSentState = new TreeState(this.currentSentStateIdx + 1, this.currentTreeState._sentence_id, this.currentTreeState._lang, this.currentTreeState._notes, [], nodes, this.currentTreeState.clickState);
        this.replace(newSentState, update, idx);
    }
    static replaceSentStateFromNodes = (nodes, update, idx) => (state) => {
        const newSentState = new TreeState(state.currentSentStateIdx + 1, state.currentTreeState._sentence_id, state.currentTreeState._lang, state.currentTreeState._notes, [], nodes, state.currentTreeState.clickState);
        state.replace(newSentState, update, idx);
    };
    get slashes() {
        return this.currentTreeState.slashes;
    }
    undo = () => {
        TreeStateIO.undo(this);
    };
    static undo = (state) => {
        Graph.unclickEdgeLabels();
        if (state.currentSentStateIdx <= 0) {
            state.currentSentStateIdx = 0;
            return;
        }
        state.currentSentStateIdx -= 1;
        Graph.updateSimulation(state);
        TreeStateIO.updateFrontendClickState(state);
    };
    static updateFrontendClickState = (state) => {
        Graph.unclickAll();
        if (state.lastClickedId.isNothing)
            return;
        switch (state.currentTreeState.clickState.elementType) {
            case (TreeLabelType.NodeLabel):
                this.changeClickState(ClickState.none());
                break;
            case (TreeLabelType.EdgeLabel):
                this.changeClickState(ClickState.none());
                break;
        }
    };
    get xmlNode() {
        return this.currentTreeState.xmlNode;
    }
}
