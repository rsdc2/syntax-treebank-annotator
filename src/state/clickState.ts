enum ClickType {
    Right = "right",
    Left = "left",
    Middle = "middle",
    Unknown = "unknown"
}


class ClickState {
    _lastClickedId: Maybe<string> = Nothing.of<string>()
    _elementType: ElementType
    _clickType: ClickType

    constructor (
        lastClickedId: Maybe<string>,
        elementType: ElementType,
        clickType: ClickType
        ) {
        this._lastClickedId = lastClickedId
        this._elementType = elementType
        this._clickType = clickType
    }

    static of = 
        (lastLeftClickedId: Maybe<string>) =>
        (elementType: ElementType) => 
        (clickType: ClickType) =>
        {

        return new ClickState(lastLeftClickedId, elementType, clickType)
    }

    static none = () => {
        return ClickState.of
                (Nothing.of()) 
                (ElementType.Unknown)
                (ClickType.Unknown) 
    }

    get edgeLabelElement (): Maybe<HTMLDivElement> {
        if (this._elementType === ElementType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedId)
        }
        return Nothing.of()
    }

    get element (): Maybe<HTMLDivElement | SVGTextElement> {
        if (this._elementType === ElementType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedId)
        } else if (this._elementType === ElementType.NodeLabel) {
            return Graph.nodeLabelById(this._lastClickedId)
        }
        return MaybeT.of<HTMLDivElement|SVGTextElement>(null)
    }

    get elementType () {
        return this._elementType
    }

    static clicked (clickState: ClickState) {
        const clicked = clickState
            .element
            .fmap(HTML.Elem.Class.contains("clicked"))
            .unpackT(false)

        if (clicked) {
            ClickState.unclicked(clickState)
            return
        }

        clickState
            .element
            .fmap(HTML.Elem.Class.add("clicked"))
    }

    get lastClickedId () {
        return this._lastClickedId
    }

    static unclicked = (clickState: ClickState) => {
        clickState
            .element
            .fmap(HTML.Elem.Class.remove("clicked"))
    }
}
