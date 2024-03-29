enum ClickType {
    Right = "right",
    Left = "left",
    Middle = "middle",
    Unknown = "unknown"
}


class ClickState {
    _lastClickedTreeNodeId: Maybe<string> = Nothing.of<string>()
    _elementType: TreeLabelType
    _clickType: ClickType

    constructor (
        lastClickedId: Maybe<string>,
        elementType: TreeLabelType,
        clickType: ClickType
        ) {
        this._lastClickedTreeNodeId = lastClickedId
        this._elementType = elementType
        this._clickType = clickType
    }

    static of = 
        (lastLeftClickedTreeNodeId: Maybe<string>) =>
        (elementType: TreeLabelType) => 
        (clickType: ClickType) =>
        {

        return new ClickState(lastLeftClickedTreeNodeId, elementType, clickType)
    }

    static none = () => {
        return ClickState.of
                (Nothing.of()) 
                (TreeLabelType.Unknown)
                (ClickType.Unknown) 
    }

    get edgeLabelElement (): Maybe<HTMLDivElement> {
        if (this._elementType === TreeLabelType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedTreeNodeId)
        }
        return Nothing.of()
    }

    get currentClickedLabelElem (): Maybe<HTMLDivElement | SVGTextElement> {
        if (this._elementType === TreeLabelType.EdgeLabel) {
            return Graph.edgeLabelById(this._lastClickedTreeNodeId)
        } else if (this._elementType === TreeLabelType.NodeLabel) {
            return Graph.nodeLabelById(this._lastClickedTreeNodeId)
        }
        return MaybeT.of<HTMLDivElement|SVGTextElement>(null)
    }

    get currentClickedCircleElem (): Maybe<SVGCircleElement> {
        return  this._lastClickedTreeNodeId.bind(SVG.Circle.circleByTreeNodeId)
    }

    get elementType () {
        return this._elementType
    }

    static clicked (clickState: ClickState) {
        const labelClicked = clickState
            .currentClickedLabelElem
            .fmap(HTML.Elem.Class.contains("clicked"))
            .fromMaybe(false)

        const circleClicked = clickState
            .currentClickedCircleElem
            .fmap(HTML.Elem.Class.contains("clicked"))
            .fromMaybe(false)

        if (labelClicked || circleClicked) {
            ClickState.unclicked(clickState)
            return
        }

        clickState
            .currentClickedLabelElem
            .fmap(HTML.Elem.Class.add("clicked"))
        clickState
            .currentClickedCircleElem
            .fmap(HTML.Elem.Class.add("clicked"))
    }

    get lastClickedId () {
        return this._lastClickedTreeNodeId
    }

    static unclicked = (clickState: ClickState) => {
        clickState
            .currentClickedLabelElem
            .fmap(HTML.Elem.Class.remove("clicked"))
        clickState
            .currentClickedCircleElem
            .fmap(HTML.Elem.Class.remove("clicked"))

    }
}
