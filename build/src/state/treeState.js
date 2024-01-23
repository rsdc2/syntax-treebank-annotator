/**
 * Holds all information pertinent to a given tree representation.
 */
class TreeState {
    _state_id;
    _sentence_id;
    _lang;
    _notes;
    _tokens;
    _nodes;
    _clickState = ClickState.of(Nothing.of())(TreeLabelType.Unknown)(ClickType.Unknown);
    constructor(state_id, sentence_id, lang, notes, tokens, nodes, clickState) {
        this._state_id = state_id;
        this._sentence_id = sentence_id;
        this._lang = lang;
        this._notes = notes;
        this._tokens = tokens;
        this._nodes = nodes;
        this._clickState = clickState;
    }
    get arethusaSentence() {
        return TreeState
            .arethusaSentence(this);
    }
    static arethusaSentence = (s) => {
        return TreeState
            .toArethusaXMLNode(s)
            .fmap(ArethusaSentence.fromXMLNode);
    };
    get clickState() {
        return this._clickState;
    }
    set clickState(value) {
        this._clickState = value;
    }
    static setClickState = (value) => (treeState) => {
        treeState.clickState = value;
    };
    static deepcopy = (t) => {
        return TreeState.of(t._state_id)(t._sentence_id, t._lang, t._notes)(Obj.deepcopy(t._tokens))(Obj.deepcopy(t._nodes))(ClickState.of(t._clickState._lastClickedTreeNodeId)(t._clickState._elementType)(t._clickState._clickType));
    };
    get id() {
        return this._state_id;
    }
    set id(value) {
        this._state_id = value;
    }
    static nodeByTokenId = (tokenId) => (sentState) => {
        return TreeNode.nodeByTokenId(tokenId)(sentState.nodes);
    };
    static nodeByTreeNodeId = (treeNodeId) => (sentState) => {
        return MaybeT.of(sentState
            .nodes
            .find((node) => node.treeNodeId === parseInt(treeNodeId)));
    };
    nodeByTokenId = (depIdx) => {
        return TreeState.nodeByTokenId(depIdx)(this);
    };
    nodeByTreeNodeId = (depIdx) => {
        return TreeState.nodeByTreeNodeId(depIdx)(this);
    };
    static nodeBySlashIdFromTreeNodeIds = (slashId) => (sentState) => {
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
    nodeBySlashIdFromTreeNodeIds = (slashId) => {
        return TreeState
            .nodeBySlashIdFromTreeNodeIds(slashId)(this);
    };
    static nodeRelation = (depIdx) => (sentState) => {
        return TreeState
            .nodeByTreeNodeId(depIdx)(sentState)
            .fmap(TreeNode.relation);
    };
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
    static of = (stateId) => (sentenceId, lang, notes) => (tokens) => (nodes) => (clickState) => {
        return new TreeState(stateId, sentenceId, notes, lang, tokens, nodes, clickState);
    };
    static ofTokens = (sentence_id, lang, notes) => (tokens) => {
        const nodes = tokens
            .map(TreeNode.tokenToTreeNode);
        return new TreeState(globalState
            .treeStateIO
            .fmap(TreeStateIO.currentStateId)
            .fmap(Num.add(1))
            .fromMaybe(0), sentence_id, lang, notes, tokens, nodes, ClickState.none());
    };
    static ofTokensWithExistingNodes = (nodes) => (sentence_id, lang, notes) => (tokens) => {
        const tokensWithRoot = Arr
            .unshift(Obj.deepcopy(tokens), Constants.rootToken);
        const _nodes = tokensWithRoot
            .map(TreeNode.tokenToTreeNodeFromExistingNode(nodes));
        return new TreeState(globalState
            .treeStateIO
            .fmap(TreeStateIO.currentStateId)
            .fmap(Num.add(1))
            .fromMaybe(0), sentence_id, lang, notes, tokens, _nodes, ClickState.none());
    };
    get slashes() {
        return this.nodes
            .reduce((acc, node) => {
            return Arr.concat(acc)(node
                .secondaryDeps
                .map(SecondaryDep.ofInterface));
        }, []);
    }
    slashBySlashId = (slashId) => {
        return MaybeT.of(this
            .slashes
            .find((slash) => {
            return SecondaryDep
                .ofInterface(slash)
                .slashIdFromTreeNodeIds(this).unpack("") === slashId;
        }));
    };
    get tokens() {
        return this._tokens;
    }
    set tokens(value) {
        this._tokens = value;
    }
    static tokenIdToTreeNodeId = (tokenId) => (treeState) => {
        return treeState
            .nodeByTokenId(Str.fromNum(tokenId))
            .fmap(TreeNode.treeNodeId);
    };
    tokenIdToTreeNodeId = (tokenId) => {
        return TreeState.tokenIdToTreeNodeId(tokenId)(this);
    };
    static toArethusaSentenceXMLStr = (s) => {
        const xmlWords = s
            .nodesNoRoot
            .map(TreeNode.toArethusaWordXMLStr);
        return `<sentence id="${s._sentence_id}" notes="${s._notes}" xml:lang="${s._lang}">`
            .concat(...xmlWords)
            .concat(`</sentence>`);
    };
    static toArethusaXMLNode = (s) => {
        return MaybeT.of(XML
            .fromXMLStr(TreeState.toArethusaSentenceXMLStr(s))
            .firstChild);
    };
    static treeNodeIdToTokenId = (treeNodeId) => (sentState) => {
        return sentState
            .nodeByTreeNodeId(Str.fromNum(treeNodeId))
            .fmap(TreeNode.tokenId);
    };
    treeNodeIdToTokenId = (treeNodeId) => {
        return TreeState.treeNodeIdToTokenId(treeNodeId)(this);
    };
    get xmlNode() {
        return TreeState.toArethusaXMLNode(this);
    }
}
