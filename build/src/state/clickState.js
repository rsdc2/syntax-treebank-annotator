var ClickType;
(function (ClickType) {
    ClickType["Right"] = "right";
    ClickType["Left"] = "left";
    ClickType["Middle"] = "middle";
    ClickType["Unknown"] = "unknown";
})(ClickType || (ClickType = {}));
class ClickState {
    _lastClickedTreeNodeId = Nothing.of();
    _elementType;
    _clickType;
    constructor(lastClickedId, elementType, clickType) {
        this._lastClickedTreeNodeId = lastClickedId;
        this._elementType = elementType;
        this._clickType = clickType;
    }
    static of = (lastLeftClickedTreeNodeId) => (elementType) => (clickType) => {
        return new ClickState(lastLeftClickedTreeNodeId, elementType, clickType);
    };
    static none = () => {
        return ClickState.of(Nothing.of())(TreeLabelType.Unknown)(ClickType.Unknown);
    };
    get edgeLabelElement() {
        if (this._elementType === TreeLabelType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedTreeNodeId);
        }
        return Nothing.of();
    }
    get currentClickedLabelElem() {
        if (this._elementType === TreeLabelType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedTreeNodeId);
        }
        else if (this._elementType === TreeLabelType.NodeLabel) {
            return Graph.nodeLabelById(this._lastClickedTreeNodeId);
        }
        return MaybeT.of(null);
    }
    get currentClickedCircleElem() {
        return this._lastClickedTreeNodeId.bind(SVG.Circle.circleByTreeNodeId);
    }
    get elementType() {
        return this._elementType;
    }
    static clicked(clickState) {
        const labelClicked = clickState
            .currentClickedLabelElem
            .fmap(HTML.Elem.Class.contains("clicked"))
            .fromMaybe(false);
        const circleClicked = clickState
            .currentClickedCircleElem
            .fmap(HTML.Elem.Class.contains("clicked"))
            .fromMaybe(false);
        if (labelClicked || circleClicked) {
            ClickState.unclicked(clickState);
            return;
        }
        clickState
            .currentClickedLabelElem
            .fmap(HTML.Elem.Class.add("clicked"));
        clickState
            .currentClickedCircleElem
            .fmap(HTML.Elem.Class.add("clicked"));
    }
    get lastClickedId() {
        return this._lastClickedTreeNodeId;
    }
    static unclicked = (clickState) => {
        clickState
            .currentClickedLabelElem
            .fmap(HTML.Elem.Class.remove("clicked"));
        clickState
            .currentClickedCircleElem
            .fmap(HTML.Elem.Class.remove("clicked"));
    };
}
