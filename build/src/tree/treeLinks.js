var LinkType;
(function (LinkType) {
    LinkType["Head"] = "head";
    LinkType["Slash"] = "slash";
    LinkType["Unknown"] = "unknown";
})(LinkType || (LinkType = {}));
var ArcType;
(function (ArcType) {
    ArcType["Straight"] = "straight";
    ArcType["Curved"] = "curved";
})(ArcType || (ArcType = {}));
var TreeLinks;
(function (TreeLinks) {
    TreeLinks.createId = (edgeType) => (srcIdx) => (tgtIdx) => {
        return `s${srcIdx}t${tgtIdx}-${edgeType}`;
    };
    TreeLinks.createEdgeLabelIdFromTokenIds = (slash) => (edgeType) => {
        return `edl-${Slash.createIdFromTokenIds(slash)}-${edgeType}`;
    };
    TreeLinks.createPathIdFromTokenIds = (slash) => (edgeType) => {
        return `edg-${Slash.createIdFromTokenIds(slash)}-${edgeType}`;
    };
    TreeLinks.createEdgeLabelIdFromTreeNodeIds = (sentState) => (slash) => (edgeType) => {
        return `edl-${Slash.createIdFromTreeNodeIds(sentState)(slash)}-${edgeType}`;
    };
    TreeLinks.createPathIdFromTreeNodeIds = (sentState) => (slash) => (edgeType) => {
        return `edg-${Slash.createIdFromTreeNodeIds(sentState)(slash)}-${edgeType}`;
    };
})(TreeLinks || (TreeLinks = {}));
