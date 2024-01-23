class SecondaryDep {
    _headTokenId;
    _depTokenId; // Secondary dependencies stored on the child
    _relation;
    constructor(srcTokenId, tgtTokenId, relation) {
        this._relation = relation;
        this._depTokenId = tgtTokenId;
        this._headTokenId = srcTokenId;
    }
    static changeRel = (newRel) => (slash) => {
        return SecondaryDep.ofTokenIds(slash._headTokenId)(slash._depTokenId)(newRel);
    };
    static createIdFromTokenIds = (slash) => {
        return TreeLinks.createId(LinkType.Slash)(slash.headTokenId)(slash.depTokenId);
    };
    static createIdFromTreeNodeIds = (sentState) => (slash) => {
        const headTreeNodeId = SecondaryDep.headTreeNodeId(sentState)(slash);
        const depTreeNodeId = SecondaryDep.depTreeNodeId(sentState)(slash);
        return depTreeNodeId.applyFmap(headTreeNodeId.fmap(TreeLinks.createId(LinkType.Slash)));
    };
    static createEdgeLabelIdFromTokenIds = (slash) => {
        return TreeLinks.createEdgeLabelIdFromTokenIds(slash)("slash");
    };
    static createEdgeLabelIdFromTreeNodeIds = (sentState) => (secondaryDep) => {
        return TreeLinks.createEdgeLabelIdFromTreeNodeIds(sentState)(secondaryDep)("slash");
    };
    static createPathIdFromTokenIds = (slash) => {
        return TreeLinks.createPathIdFromTokenIds(slash)("slash");
    };
    static createPathIdFromTreeNodeIds = (sentState) => (slash) => {
        return TreeLinks.createPathIdFromTreeNodeIds(sentState)(slash)("slash");
    };
    static depTokenId = (slash) => {
        return slash._depTokenId;
    };
    get depTokenId() {
        return this._depTokenId;
    }
    static depTreeNodeId = (sentState) => (slash) => {
        return sentState.tokenIdToTreeNodeId(slash._depTokenId);
    };
    depTreeNodeId = (sentState) => {
        return SecondaryDep.depTreeNodeId(sentState)(this);
    };
    get edgeLabelIdFromTokenIds() {
        return SecondaryDep.createEdgeLabelIdFromTokenIds(this);
    }
    edgeLabelIdFromTreeNodeIds = (sentState) => {
        return SecondaryDep.createEdgeLabelIdFromTreeNodeIds(sentState)(this);
    };
    get edgePathIdFromTokenIds() {
        return SecondaryDep.createPathIdFromTokenIds(this);
    }
    edgePathIdFromTreeNodeIds = (sentState) => {
        return SecondaryDep.createPathIdFromTreeNodeIds(sentState)(this);
    };
    static headTokenId = (slash) => {
        return slash._headTokenId;
    };
    get headTokenId() {
        return this._headTokenId;
    }
    static headTreeNodeId = (sentState) => (slash) => {
        return sentState.tokenIdToTreeNodeId(slash._headTokenId);
    };
    headTreeNodeId = (sentState) => {
        return SecondaryDep.headTreeNodeId(sentState)(this);
    };
    get slashIdFromTokenIds() {
        return SecondaryDep.createIdFromTokenIds(this);
    }
    slashIdFromTreeNodeIds = (sentState) => {
        return SecondaryDep.createIdFromTreeNodeIds(sentState)(this);
    };
    static parseSecDep = (s) => {
        const parts = s.split(":");
        if (parts.length !== 2) {
            return ["", ""];
        }
        return [parts[0], parts[1]];
    };
    static ofStr = (depId) => (s) => {
        const [headId, rel] = SecondaryDep.parseSecDep(s);
        return {
            _headTokenId: Str.toNum(headId),
            _depTokenId: Str.toNum(depId),
            _relation: rel
        };
    };
    static ofTokenIds = (headTokenId) => (depTokenId) => (relation) => {
        return new SecondaryDep(headTokenId, depTokenId, relation);
    };
    static ofTreeNodeIds = (treeState) => (headTreeNodeId) => (depTreeNodeId) => (relation) => {
        const headTokenId = treeState.treeNodeIdToTokenId(headTreeNodeId);
        const depTokenId = treeState.treeNodeIdToTokenId(depTreeNodeId);
        return MaybeT.of(relation)
            .applyFmap(depTokenId
            .applyFmap(headTokenId.fmap(SecondaryDep.ofTokenIds)));
    };
    static ofInterface = (islash) => {
        return new SecondaryDep(islash._headTokenId, islash._depTokenId, islash._relation);
    };
    get relation() {
        return this._relation;
    }
    set relation(value) {
        this._relation = value;
    }
    static relation = (slash) => {
        return slash.relation;
    };
    static toStr = (iSlash) => {
        if (MaybeT.of(iSlash._headTokenId).isNothing) {
            return "";
        }
        return `${iSlash._headTokenId}:${iSlash._relation}`;
    };
}
