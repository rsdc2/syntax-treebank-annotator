interface ISelRange {
    anchorNode: Node,
    anchorExtent: number,
    focusNode: Node,
    focusExtent: number
}

interface ICursorPos {
    anchorNode: Node,
    offset: number
}

class SelRange implements ISelRange {
    anchorNode: Node
    anchorExtent: number
    focusNode: Node
    focusExtent: number

    constructor (anchorNode: Node, anchorExtent: number, focusNode: Node, focusExtent: number) {
        this.anchorNode = anchorNode
        this.anchorExtent = anchorExtent
        this.focusNode = focusNode
        this.focusExtent = focusExtent
    }
}

class CursorPos implements ICursorPos {

    anchorNode: Node
    offset: number

    constructor (node: Node, extent: number) {
        this.anchorNode = node
        this.offset = extent
    }

    static of = (offset: number) => (anchorNode: Node) => {
        return new CursorPos (anchorNode, offset)
    }

    static ofMaybes = (node: Maybe<Node>) => (extent: Maybe<number>) => {
        const f = flip(CursorPos.of)
        const nodeFunc = node.fmap(f)
        return extent.applyFmap(nodeFunc)
    }
}

class Sel {

    static anchorNode = (sel: Selection) => {
        return MaybeT.of(sel.anchorNode)
    }
    
    static anchorOffset = (sel: Selection) => {
        return sel.anchorOffset
    }

    static extentNode = (sel: Selection) => {
        return MaybeT.of(sel.focusNode)
    }

    static extentOffset = (sel: Selection) => {
        return sel.focusOffset
    }

    static setBaseAndExtent = (selRange: SelRange) => (sel: Selection) =>  {
        sel.setBaseAndExtent(
            selRange.anchorNode,
            selRange.anchorExtent,
            selRange.focusNode,
            selRange.focusExtent
        )
    }

    static setCursorPos = (cursorPos: CursorPos) => (sel: Selection) =>  {
        sel.setBaseAndExtent(
            cursorPos.anchorNode,
            cursorPos.offset,
            cursorPos.anchorNode,
            cursorPos.offset,
        )
    }


}