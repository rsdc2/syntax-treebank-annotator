/**
 * Holds all information pertinent to a given tree representation.
 */
class TreeState {
    constructor(state_id, sentence_id, lang, tokens, nodes, clickState) {
        this._clickState = ClickState.of(Nothing.of())(TreeLabelType.Unknown)(ClickType.Unknown);
        this.nodeByTokenId = (depIdx) => {
            return TreeState.nodeByTokenId(depIdx)(this);
        };
        this.nodeByTreeNodeId = (depIdx) => {
            return TreeState.nodeByTreeNodeId(depIdx)(this);
        };
        this.nodeBySlashIdFromTreeNodeIds = (slashId) => {
            return TreeState
                .nodeBySlashIdFromTreeNodeIds(slashId)(this);
        };
        this.slashBySlashId = (slashId) => {
            return MaybeT.of(this
                .slashes
                .find((slash) => {
                return SecondaryDep
                    .ofInterface(slash)
                    .slashIdFromTreeNodeIds(this).unpack("") === slashId;
            }));
        };
        this.tokenIdToTreeNodeId = (tokenId) => {
            return TreeState.tokenIdToTreeNodeId(tokenId)(this);
        };
        this.treeNodeIdToTokenId = (treeNodeId) => {
            return TreeState.treeNodeIdToTokenId(treeNodeId)(this);
        };
        this._state_id = state_id;
        this._sentence_id = sentence_id;
        this._lang = lang;
        this._tokens = tokens;
        this._nodes = nodes;
        this._clickState = clickState;
    }
    get arethusaSentence() {
        return TreeState
            .arethusaSentence(this);
    }
    get clickState() {
        return this._clickState;
    }
    set clickState(value) {
        this._clickState = value;
    }
    get id() {
        return this._state_id;
    }
    set id(value) {
        this._state_id = value;
    }
    get nodes() {
        return this._nodes;
    }
    get nodesNoRoot() {
        return this
            ._nodes
            .filter((node) => node.type !== NodeType.Root);
    }
    set nodes(value) {
        this._nodes = value;
    }
    get slashes() {
        return this.nodes
            .reduce((acc, node) => {
            return Arr.concat(acc)(node
                .secondaryDeps
                .map(SecondaryDep.ofInterface));
        }, []);
    }
    get tokens() {
        return this._tokens;
    }
    set tokens(value) {
        this._tokens = value;
    }
    get xmlNode() {
        return TreeState.toArethusaXMLNode(this);
    }
}
TreeState.arethusaSentence = (s) => {
    return TreeState
        .toArethusaXMLNode(s)
        .fmap(ArethusaSentence.fromXMLNode);
};
TreeState.setClickState = (value) => (treeState) => {
    treeState.clickState = value;
};
TreeState.deepcopy = (t) => {
    return TreeState.of(t._state_id)(t._sentence_id, t._lang)(Obj.deepcopy(t._tokens))(Obj.deepcopy(t._nodes))(ClickState.of(t._clickState._lastClickedTreeNodeId)(t._clickState._elementType)(t._clickState._clickType));
};
TreeState.nodeByTokenId = (tokenId) => (sentState) => {
    return TreeNode.nodeByTokenId(tokenId)(sentState.nodes);
};
TreeState.nodeByTreeNodeId = (treeNodeId) => (sentState) => {
    return MaybeT.of(sentState
        .nodes
        .find((node) => node.treeNodeId === parseInt(treeNodeId)));
};
TreeState.nodeBySlashIdFromTreeNodeIds = (slashId) => (sentState) => {
    return MaybeT.of(sentState
        .slashes
        .find((islash) => {
        return SecondaryDep
            .ofInterface(islash)
            .slashIdFromTreeNodeIds(sentState)
            .eq(slashId);
    }))
        .bind(SecondaryDep.depTreeNodeId(sentState))
        .fmap(Str.fromNum)
        .bind(sentState.nodeByTreeNodeId);
};
TreeState.nodeRelation = (depIdx) => (sentState) => {
    return TreeState
        .nodeByTreeNodeId(depIdx)(sentState)
        .fmap(TreeNode.relation);
};
TreeState.of = (stateId) => (sentenceId, lang) => (tokens) => (nodes) => (clickState) => {
    return new TreeState(stateId, sentenceId, lang, tokens, nodes, clickState);
};
TreeState.ofTokens = (sentence_id, lang) => (tokens) => {
    const nodes = tokens
        .map(TreeNode.tokenToTreeNode);
    return new TreeState(globalState
        .treeStateIO
        .fmap(TreeStateIO.currentStateId)
        .fmap(Num.add(1))
        .fromMaybe(0), sentence_id, lang, tokens, nodes, ClickState.none());
};
TreeState.ofTokensWithExistingNodes = (nodes) => (sentence_id, lang) => (tokens) => {
    const tokensWithRoot = Arr
        .unshift(Obj.deepcopy(tokens), Constants.rootToken);
    const _nodes = tokensWithRoot
        .map(TreeNode.tokenToTreeNodeFromExistingNode(nodes));
    return new TreeState(globalState
        .treeStateIO
        .fmap(TreeStateIO.currentStateId)
        .fmap(Num.add(1))
        .fromMaybe(0), sentence_id, lang, tokens, _nodes, ClickState.none());
};
TreeState.tokenIdToTreeNodeId = (tokenId) => (treeState) => {
    return treeState
        .nodeByTokenId(Str.fromNum(tokenId))
        .fmap(TreeNode.treeNodeId);
};
TreeState.toArethusaSentenceXMLStr = (s) => {
    const xmlWords = s
        .nodesNoRoot
        .map(TreeNode.toArethusaWordXMLStr);
    return `<sentence id="${s._sentence_id}">`
        .concat(...xmlWords)
        .concat(`</sentence>`);
};
TreeState.toArethusaXMLNode = (s) => {
    return MaybeT.of(XML
        .fromXMLStr(TreeState.toArethusaSentenceXMLStr(s))
        .firstChild);
};
TreeState.treeNodeIdToTokenId = (treeNodeId) => (sentState) => {
    return sentState
        .nodeByTreeNodeId(Str.fromNum(treeNodeId))
        .fmap(TreeNode.tokenId);
};
