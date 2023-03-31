class SecondaryDep {
    constructor(srcTokenId, tgtTokenId, relation) {
        this.depTreeNodeId = (sentState) => {
            return SecondaryDep.depTreeNodeId(sentState)(this);
        };
        this.edgeLabelIdFromTreeNodeIds = (sentState) => {
            return SecondaryDep.createEdgeLabelIdFromTreeNodeIds(sentState)(this);
        };
        this.edgePathIdFromTreeNodeIds = (sentState) => {
            return SecondaryDep.createPathIdFromTreeNodeIds(sentState)(this);
        };
        this.headTreeNodeId = (sentState) => {
            return SecondaryDep.headTreeNodeId(sentState)(this);
        };
        this.slashIdFromTreeNodeIds = (sentState) => {
            return SecondaryDep.createIdFromTreeNodeIds(sentState)(this);
        };
        this._relation = relation;
        this._depTokenId = tgtTokenId;
        this._headTokenId = srcTokenId;
    }
    get depTokenId() {
        return this._depTokenId;
    }
    get edgeLabelIdFromTokenIds() {
        return SecondaryDep.createEdgeLabelIdFromTokenIds(this);
    }
    get edgePathIdFromTokenIds() {
        return SecondaryDep.createPathIdFromTokenIds(this);
    }
    get headTokenId() {
        return this._headTokenId;
    }
    get slashIdFromTokenIds() {
        return SecondaryDep.createIdFromTokenIds(this);
    }
    get relation() {
        return this._relation;
    }
    set relation(value) {
        this._relation = value;
    }
}
SecondaryDep.changeRel = (newRel) => (slash) => {
    return SecondaryDep.ofTokenIds(slash._headTokenId)(slash._depTokenId)(newRel);
};
SecondaryDep.createIdFromTokenIds = (slash) => {
    return TreeLinks.createId(LinkType.Slash)(slash.headTokenId)(slash.depTokenId);
};
SecondaryDep.createIdFromTreeNodeIds = (sentState) => (slash) => {
    const headTreeNodeId = SecondaryDep.headTreeNodeId(sentState)(slash);
    const depTreeNodeId = SecondaryDep.depTreeNodeId(sentState)(slash);
    return depTreeNodeId.applyFmap(headTreeNodeId.fmap(TreeLinks.createId(LinkType.Slash)));
};
SecondaryDep.createEdgeLabelIdFromTokenIds = (slash) => {
    return TreeLinks.createEdgeLabelIdFromTokenIds(slash)("slash");
};
SecondaryDep.createEdgeLabelIdFromTreeNodeIds = (sentState) => (secondaryDep) => {
    return TreeLinks.createEdgeLabelIdFromTreeNodeIds(sentState)(secondaryDep)("slash");
};
SecondaryDep.createPathIdFromTokenIds = (slash) => {
    return TreeLinks.createPathIdFromTokenIds(slash)("slash");
};
SecondaryDep.createPathIdFromTreeNodeIds = (sentState) => (slash) => {
    return TreeLinks.createPathIdFromTreeNodeIds(sentState)(slash)("slash");
};
SecondaryDep.depTokenId = (slash) => {
    return slash._depTokenId;
};
SecondaryDep.depTreeNodeId = (sentState) => (slash) => {
    return sentState.tokenIdToTreeNodeId(slash._depTokenId);
};
SecondaryDep.headTokenId = (slash) => {
    return slash._headTokenId;
};
SecondaryDep.headTreeNodeId = (sentState) => (slash) => {
    return sentState.tokenIdToTreeNodeId(slash._headTokenId);
};
SecondaryDep.parseSecDep = (s) => {
    const parts = s.split(":");
    if (parts.length !== 2) {
        return ["", ""];
    }
    return [parts[0], parts[1]];
};
SecondaryDep.ofStr = (depId) => (s) => {
    const [headId, rel] = SecondaryDep.parseSecDep(s);
    return {
        _headTokenId: Str.toNum(headId),
        _depTokenId: Str.toNum(depId),
        _relation: rel
    };
};
SecondaryDep.ofTokenIds = (headTokenId) => (depTokenId) => (relation) => {
    return new SecondaryDep(headTokenId, depTokenId, relation);
};
SecondaryDep.ofTreeNodeIds = (treeState) => (headTreeNodeId) => (depTreeNodeId) => (relation) => {
    const headTokenId = treeState.treeNodeIdToTokenId(headTreeNodeId);
    const depTokenId = treeState.treeNodeIdToTokenId(depTreeNodeId);
    return MaybeT.of(relation)
        .applyFmap(depTokenId
        .applyFmap(headTokenId.fmap(SecondaryDep.ofTokenIds)));
};
SecondaryDep.ofInterface = (islash) => {
    return new SecondaryDep(islash._headTokenId, islash._depTokenId, islash._relation);
};
SecondaryDep.relation = (slash) => {
    return slash.relation;
};
SecondaryDep.toStr = (iSlash) => {
    return `${iSlash._headTokenId}:${iSlash._relation}`;
};
