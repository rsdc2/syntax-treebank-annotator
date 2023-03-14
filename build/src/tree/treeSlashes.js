class Slash {
    constructor(srcTokenId, tgtTokenId, relation) {
        this.depTreeNodeId = (sentState) => {
            return Slash.depTreeNodeId(sentState)(this);
        };
        this.edgeLabelIdFromTreeNodeIds = (sentState) => {
            return Slash.createEdgeLabelIdFromTreeNodeIds(sentState)(this);
        };
        this.edgePathIdFromTreeNodeIds = (sentState) => {
            return Slash.createPathIdFromTreeNodeIds(sentState)(this);
        };
        this.headTreeNodeId = (sentState) => {
            return Slash.headTreeNodeId(sentState)(this);
        };
        this.slashIdFromTreeNodeIds = (sentState) => {
            return Slash.createIdFromTreeNodeIds(sentState)(this);
        };
        this._relation = relation;
        this._depTokenId = tgtTokenId;
        this._headTokenId = srcTokenId;
    }
    get depTokenId() {
        return this._depTokenId;
    }
    get edgeLabelIdFromTokenIds() {
        return Slash.createEdgeLabelIdFromTokenIds(this);
    }
    get edgePathIdFromTokenIds() {
        return Slash.createPathIdFromTokenIds(this);
    }
    get headTokenId() {
        return this._headTokenId;
    }
    get slashIdFromTokenIds() {
        return Slash.createIdFromTokenIds(this);
    }
    get relation() {
        return this._relation;
    }
    set relation(value) {
        this._relation = value;
    }
}
Slash.changeRel = (newRel) => (slash) => {
    return Slash.ofTokenIds(slash._headTokenId)(slash._depTokenId)(newRel);
};
Slash.createIdFromTokenIds = (slash) => {
    return TreeLinks.createId(LinkType.Slash)(slash.headTokenId)(slash.depTokenId);
};
Slash.createIdFromTreeNodeIds = (sentState) => (slash) => {
    const headTreeNodeId = Slash.headTreeNodeId(sentState)(slash);
    const depTreeNodeId = Slash.depTreeNodeId(sentState)(slash);
    return depTreeNodeId.applyFmap(headTreeNodeId.fmap(TreeLinks.createId(LinkType.Slash)));
};
Slash.createEdgeLabelIdFromTokenIds = (slash) => {
    return TreeLinks.createEdgeLabelIdFromTokenIds(slash)("slash");
};
Slash.createEdgeLabelIdFromTreeNodeIds = (sentState) => (slash) => {
    return TreeLinks.createEdgeLabelIdFromTreeNodeIds(sentState)(slash)("slash");
};
Slash.createPathIdFromTokenIds = (slash) => {
    return TreeLinks.createPathIdFromTokenIds(slash)("slash");
};
Slash.createPathIdFromTreeNodeIds = (sentState) => (slash) => {
    return TreeLinks.createPathIdFromTreeNodeIds(sentState)(slash)("slash");
};
Slash.depTokenId = (slash) => {
    return slash._depTokenId;
};
Slash.depTreeNodeId = (sentState) => (slash) => {
    return sentState.tokenIdToTreeNodeId(slash._depTokenId);
};
Slash.headTokenId = (slash) => {
    return slash._headTokenId;
};
Slash.headTreeNodeId = (sentState) => (slash) => {
    return sentState.tokenIdToTreeNodeId(slash._headTokenId);
};
Slash.parseSecDep = (s) => {
    const parts = s.split(":");
    if (parts.length !== 2) {
        return ["", ""];
    }
    return [parts[0], parts[1]];
};
Slash.ofStr = (depId) => (s) => {
    const [headId, rel] = Slash.parseSecDep(s);
    return {
        _headTokenId: Str.toNum(headId),
        _depTokenId: Str.toNum(depId),
        _relation: rel
    };
};
Slash.ofTokenIds = (headTokenId) => (depTokenId) => (relation) => {
    return new Slash(headTokenId, depTokenId, relation);
};
Slash.ofTreeNodeIds = (sentState) => (headTreeNodeId) => (depTreeNodeId) => (relation) => {
    const headTokenId = sentState.treeNodeIdToTokenId(headTreeNodeId);
    const depTokenId = sentState.treeNodeIdToTokenId(depTreeNodeId);
    return MaybeT.of(relation).applyFmap(depTokenId.applyFmap(headTokenId.fmap(Slash.ofTokenIds)));
};
Slash.ofI = (islash) => {
    return new Slash(islash._headTokenId, islash._depTokenId, islash._relation);
};
Slash.relation = (slash) => {
    return slash.relation;
};
Slash.toStr = (iSlash) => {
    return `${iSlash._headTokenId}:${iSlash._relation}`;
};
