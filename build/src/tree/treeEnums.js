var NodeType;
(function (NodeType) {
    NodeType["Root"] = "root";
    NodeType["Leaf"] = "leaf";
    NodeType["Branch"] = "branch";
    NodeType["NonRoot"] = "non-root";
    NodeType["None"] = "none";
})(NodeType || (NodeType = {}));
var TreeTokenType;
(function (TreeTokenType) {
    TreeTokenType["Root"] = "root";
    TreeTokenType["NonRoot"] = "non-root";
})(TreeTokenType || (TreeTokenType = {}));
var ArtificialType;
(function (ArtificialType) {
    ArtificialType["Elliptic"] = "elliptic";
    ArtificialType["None"] = "none";
})(ArtificialType || (ArtificialType = {}));
var TreeLabelType;
(function (TreeLabelType) {
    TreeLabelType["NodeLabel"] = "nodeLabel";
    TreeLabelType["EdgeLabel"] = "edgeLabel";
    TreeLabelType["Unknown"] = "unknown";
})(TreeLabelType || (TreeLabelType = {}));
