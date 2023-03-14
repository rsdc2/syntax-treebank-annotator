var ClickType;
(function (ClickType) {
    ClickType["Right"] = "right";
    ClickType["Left"] = "left";
    ClickType["Middle"] = "middle";
    ClickType["Unknown"] = "unknown";
})(ClickType || (ClickType = {}));
class ClickState {
    constructor(lastClickedId, elementType, clickType) {
        this._lastClickedId = Nothing.of();
        this._lastClickedId = lastClickedId;
        this._elementType = elementType;
        this._clickType = clickType;
    }
    get edgeLabelElement() {
        if (this._elementType === ElementType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedId);
        }
        return Nothing.of();
    }
    get element() {
        if (this._elementType === ElementType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedId);
        }
        else if (this._elementType === ElementType.NodeLabel) {
            return Graph.nodeLabelById(this._lastClickedId);
        }
        return MaybeT.of(null);
    }
    get elementType() {
        return this._elementType;
    }
    static clicked(clickState) {
        const clicked = clickState
            .element
            .fmap(HTML.Elem.Class.contains("clicked"))
            .unpackT(false);
        if (clicked) {
            ClickState.unclicked(clickState);
            return;
        }
        clickState
            .element
            .fmap(HTML.Elem.Class.add("clicked"));
    }
    get lastClickedId() {
        return this._lastClickedId;
    }
}
ClickState.of = (lastLeftClickedId) => (elementType) => (clickType) => {
    return new ClickState(lastLeftClickedId, elementType, clickType);
};
ClickState.none = () => {
    return ClickState.of(Nothing.of())(ElementType.Unknown)(ClickType.Unknown);
};
ClickState.unclicked = (clickState) => {
    clickState
        .element
        .fmap(HTML.Elem.Class.remove("clicked"));
};
