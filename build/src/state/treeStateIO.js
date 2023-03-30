var _a;
var ElementType;
(function (ElementType) {
    ElementType["NodeLabel"] = "nodeLabel";
    ElementType["EdgeLabel"] = "edgeLabel";
    ElementType["Unknown"] = "unknown";
})(ElementType || (ElementType = {}));
class TreeStateIO {
    addSentStateFromNodes(nodes, update) {
        const newSentState = new TreeState(this.currentSentStateIdx + 1, this.currentTreeState._sentence_id, [], nodes, this.currentTreeState.clickState);
        this.push(newSentState)(false)(update);
    }
    get arethusaSentence() {
        return this
            .currentTreeState
            .arethusaSentence;
    }
    get clickState() {
        return this.currentTreeState.clickState;
    }
    set clickState(value) {
        this.currentTreeState.clickState = value;
    }
    get currentSentStateIdx() {
        return this._currentSentStateIdx;
    }
    ;
    set currentSentStateIdx(value) {
        this._currentSentStateIdx = value;
    }
    ;
    constructor(sentState) {
        this._currentSentStateIdx = 0;
        this.changeEdgeLabelClickState = (newClickState) => {
            if (newClickState.elementType === ElementType.EdgeLabel) {
                // Don't do anything if clicking on the same label
                if (this.currentTreeState.clickState.elementType === ElementType.EdgeLabel) {
                    if (newClickState.lastClickedId.value === this.currentTreeState.clickState.lastClickedId.value) {
                        return;
                    }
                }
                this.currentTreeState.clickState
                    .edgeLabelElement
                    .fmap(this.changeRelation);
                Graph.unclickAll();
                newClickState
                    .labelElem
                    .fmap(HTML.Elem.setAttr("contenteditable")("true"));
                ClickState.clicked(newClickState);
            }
        };
        this.changeNode = (newNode) => {
            var _b;
            const newState = TreeStateIO.deepcopy(this.currentTreeState);
            const nodeIdx = (_b = newState._nodes) === null || _b === void 0 ? void 0 : _b.findIndex((node) => {
                return node.treeNodeId === newNode.treeNodeId;
            });
            if (nodeIdx) {
                if (newState._nodes) {
                    newState._nodes[nodeIdx] = newNode;
                }
            }
            this.addSentStateFromNodes(newState._nodes, true);
        };
        this.changeNodeValue = (nodeField) => (nodeValue) => (treeNodeId) => {
            TreeStateIO.changeNodeValue(nodeField)(nodeValue)(treeNodeId)(this);
        };
        this.changeRelation = (elem) => {
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
                            depIdx.applyFmap(newRel.fmap(this.changeNodeValue("relation")));
                            break;
                    }
                    break;
                case (LinkType.Slash):
                    const slashId = HTML.Elem.getAttr("slash-id")(elem);
                    slashId
                        .applyFmap(newRel.fmap(this.changeSlashRel));
                    break;
            }
        };
        this.changeSlashRel = (newRel) => (slashId) => {
            TreeStateIO.changeSlashRel(newRel)(slashId)(this);
        };
        this.newSlashRel = (newRel) => (headTokenIdx) => (depTokenIdx) => {
            return TreeStateIO
                .newSlashRel(newRel)(headTokenIdx)(depTokenIdx)(this);
        };
        this.push = (ts) => (ext) => (update) => {
            TreeStateIO.push(ext)(update)(ts)(this);
        };
        this.redo = () => {
            TreeStateIO.redo(this);
        };
        this.removeSlashBySlashIdFromTreeNodeIds = (slashId) => {
            TreeStateIO.removeSlashBySlashIdFromTreeNodeIds(slashId)(this);
        };
        this.replace = (state, update, sentStateToReplaceIdx) => {
            this._treeState = state;
            if (update) {
                Graph.updateSimulation_(this._treeState);
            }
        };
        this.undo = () => {
            TreeStateIO.undo(this);
        };
        if (sentState._tokens.length == 0) {
            console.error("No tokens in sentence state.");
        }
        const tokensWithRoot = Arr
            .unshift(Obj.deepcopy(sentState._tokens), Constants.rootToken);
        const nodes = TreeNode
            .tokensToTreeNodes(tokensWithRoot);
        const newSentState = new TreeState(sentState._state_id, sentState._sentence_id, tokensWithRoot, nodes, sentState._clickState);
        this._treeState = newSentState;
        this.currentSentStateIdx = 0;
    }
    ;
    get currentTreeState() {
        return this._treeState;
    }
    get lastClickedId() {
        return this
            .currentTreeState
            .clickState
            .lastClickedId;
    }
    get lastClickType() {
        return TreeStateIO.lastClickType(this);
    }
    get lastSentStateIdx() {
        return 0;
    }
    get nodes() {
        return this.currentTreeState.nodes;
    }
    replaceSentStateFromNodes(nodes, update, idx) {
        const newSentState = new TreeState(this.currentSentStateIdx + 1, this.currentTreeState._sentence_id, [], nodes, this.currentTreeState.clickState);
        this.replace(newSentState, update, idx);
    }
    get slashes() {
        return this.currentTreeState.slashes;
    }
    get xmlNode() {
        return this.currentTreeState.xmlNode;
    }
}
_a = TreeStateIO;
TreeStateIO.changeClickState = (newClickState) => (state) => {
    switch (newClickState.elementType) {
        case (ElementType.EdgeLabel):
            state.changeEdgeLabelClickState(newClickState);
            break;
        case (ElementType.NodeLabel):
            state.clickState
                .edgeLabelElement
                .fmap(state.changeRelation);
            Graph.unclickAll();
            ClickState.clicked(newClickState);
            break;
        case (ElementType.Unknown):
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
TreeStateIO.changeNodeValue = (nodeField) => (nodeValue) => (treeNodeId) => (state) => {
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
TreeStateIO.changeSlashRel = (newRel) => (slashId) => (state) => {
    const currentSlash = state
        .currentTreeState
        .slashBySlashId(slashId);
    const currentRel = currentSlash
        .fmap(SecondaryDep.relation);
    const changed = !(currentRel.eq(newRel));
    switch (changed) {
        case (true):
            const newSlash = currentSlash
                .fmap(SecondaryDep.changeRel(newRel))
                .fmap(SecondaryDep.ofI);
            const getNode = state
                .currentTreeState
                .nodeByTreeNodeId;
            const parentNode = newSlash
                .bind(SecondaryDep.depTreeNodeId(state.currentTreeState))
                .fmap(Str.fromNum)
                .bind(getNode);
            const changeSlash = newSlash.fmap(TreeNode.changeSlash);
            const newParentNode = parentNode
                .applyFmap(changeSlash);
            newParentNode.fmap(state.changeNode);
            break;
        case (false):
            Graph.unclickAll();
            break;
    }
};
TreeStateIO.currentSentStateIdx = (state) => {
    return state.currentSentStateIdx;
};
TreeStateIO.currentSentState = (state) => {
    return state.currentTreeState;
};
TreeStateIO.deepcopy = (state) => {
    return Obj.deepcopy(state);
};
TreeStateIO.lastClickedId = (state) => {
    return state
        .currentTreeState
        .clickState
        .lastClickedId;
};
TreeStateIO.lastClickType = (state) => {
    return state
        .currentTreeState
        .clickState
        ._clickType;
};
TreeStateIO.newSlashRel = (newRel) => (headTreeNodeId) => (depTreeNodeId) => (state) => {
    const slash = SecondaryDep.ofTreeNodeIds(state.currentTreeState)(headTreeNodeId)(depTreeNodeId)(newRel);
    state
        .currentTreeState
        .nodeByTreeNodeId(Str.fromNum(depTreeNodeId))
        .applyFmap(slash.fmap(TreeNode.appendSecondaryDep))
        .fmap(state.changeNode);
};
TreeStateIO.nodes = (state) => {
    return state.currentTreeState.nodes;
};
TreeStateIO.of = (sentState) => {
    return new TreeStateIO(sentState);
};
TreeStateIO.push = (ext) => (updateGraph) => (ts) => (treeStateIO) => {
    treeStateIO._treeState = ts;
    treeStateIO.currentSentStateIdx = 0;
    if (updateGraph) {
        Graph.updateSimulation_(treeStateIO._treeState);
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
TreeStateIO.redo = (state) => {
    Graph.unclickEdgeLabels();
    if (state.currentSentStateIdx >= state.lastSentStateIdx) {
        state.currentSentStateIdx = state.lastSentStateIdx;
        return;
    }
    state.currentSentStateIdx += 1;
    Graph.updateSimulation(state);
    TreeStateIO.updateFrontendClickState(state);
};
TreeStateIO.removeSlashBySlashIdFromTreeNodeIds = (slashId) => (state) => {
    const node = state
        .currentTreeState
        .nodeBySlashIdFromTreeNodeIds(slashId)
        .fmap(TreeNode.removeSlashBySlashIdFromTreeNodeIds(state.currentTreeState)(slashId));
    node.fmap(state.changeNode);
};
TreeStateIO.replaceSentStateFromNodes = (nodes, update, idx) => (state) => {
    const newSentState = new TreeState(state.currentSentStateIdx + 1, state.currentTreeState._sentence_id, [], nodes, state.currentTreeState.clickState);
    state.replace(newSentState, update, idx);
};
TreeStateIO.currentStateId = (state) => {
    return state.currentTreeState._state_id;
};
TreeStateIO.undo = (state) => {
    Graph.unclickEdgeLabels();
    if (state.currentSentStateIdx <= 0) {
        state.currentSentStateIdx = 0;
        return;
    }
    state.currentSentStateIdx -= 1;
    Graph.updateSimulation(state);
    TreeStateIO.updateFrontendClickState(state);
};
TreeStateIO.updateFrontendClickState = (state) => {
    Graph.unclickAll();
    if (state.lastClickedId.isNothing)
        return;
    switch (state.currentTreeState.clickState.elementType) {
        case (ElementType.NodeLabel):
            _a.changeClickState(ClickState.none());
            break;
        case (ElementType.EdgeLabel):
            _a.changeClickState(ClickState.none());
            break;
    }
};
