var ClickType;
(function (ClickType) {
    ClickType["Right"] = "right";
    ClickType["Left"] = "left";
    ClickType["Middle"] = "middle";
    ClickType["Unknown"] = "unknown";
})(ClickType || (ClickType = {}));
class ClickState {
    constructor(lastClickedId, elementType, clickType) {
        this._lastClickedTreeNodeId = Nothing.of();
        this._lastClickedTreeNodeId = lastClickedId;
        this._elementType = elementType;
        this._clickType = clickType;
    }
    get edgeLabelElement() {
        if (this._elementType === TreeLabelType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedTreeNodeId);
        }
        return Nothing.of();
    }
    get labelElem() {
        console.log(this._elementType);
        if (this._elementType === TreeLabelType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedTreeNodeId);
        }
        else if (this._elementType === TreeLabelType.NodeLabel) {
            return Graph.nodeLabelById(this._lastClickedTreeNodeId);
        }
        return MaybeT.of(null);
    }
    get circleElem() {
        return this._lastClickedTreeNodeId.bind(SVG.Circle.circleByTreeNodeId);
    }
    get elementType() {
        return this._elementType;
    }
    static clicked(clickState) {
        var _a;
        const labelClicked = clickState
            .labelElem
            .fmap(HTML.Elem.Class.contains("clicked"))
            .fromMaybe(false);
        console.log(labelClicked);
        const circleClicked = clickState
            .circleElem
            .fmap(HTML.Elem.Class.contains("clicked"))
            .fromMaybe(false);
        if (labelClicked || circleClicked) {
            ClickState.unclicked(clickState);
            return;
        }
        clickState
            .labelElem
            .fmap(HTML.Elem.Class.add("clicked"));
        console.log((_a = clickState.labelElem.value) === null || _a === void 0 ? void 0 : _a.classList);
        clickState
            .circleElem
            .fmap(HTML.Elem.Class.add("clicked"));
    }
    get lastClickedId() {
        return this._lastClickedTreeNodeId;
    }
}
ClickState.of = (lastLeftClickedTreeNodeId) => (elementType) => (clickType) => {
    return new ClickState(lastLeftClickedTreeNodeId, elementType, clickType);
};
ClickState.none = () => {
    return ClickState.of(Nothing.of())(TreeLabelType.Unknown)(ClickType.Unknown);
};
ClickState.unclicked = (clickState) => {
    clickState
        .labelElem
        .fmap(HTML.Elem.Class.remove("clicked"));
    clickState
        .circleElem
        .fmap(HTML.Elem.Class.remove("clicked"));
};
