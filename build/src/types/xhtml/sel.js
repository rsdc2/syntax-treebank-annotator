class SelRange {
    anchorNode;
    anchorExtent;
    focusNode;
    focusExtent;
    constructor(anchorNode, anchorExtent, focusNode, focusExtent) {
        this.anchorNode = anchorNode;
        this.anchorExtent = anchorExtent;
        this.focusNode = focusNode;
        this.focusExtent = focusExtent;
    }
}
class CursorPos {
    anchorNode;
    offset;
    constructor(node, extent) {
        this.anchorNode = node;
        this.offset = extent;
    }
    static of = (offset) => (anchorNode) => {
        return new CursorPos(anchorNode, offset);
    };
    static ofMaybes = (node) => (extent) => {
        const f = flip(CursorPos.of);
        const nodeFunc = node.fmap(f);
        return extent.applyFmap(nodeFunc);
    };
}
class Sel {
    static anchorNode = (sel) => {
        return MaybeT.of(sel.anchorNode);
    };
    static anchorOffset = (sel) => {
        return sel.anchorOffset;
    };
    static extentNode = (sel) => {
        return MaybeT.of(sel.focusNode);
    };
    static extentOffset = (sel) => {
        return sel.focusOffset;
    };
    static setBaseAndExtent = (selRange) => (sel) => {
        sel.setBaseAndExtent(selRange.anchorNode, selRange.anchorExtent, selRange.focusNode, selRange.focusExtent);
    };
    static setCursorPos = (cursorPos) => (sel) => {
        sel.setBaseAndExtent(cursorPos.anchorNode, cursorPos.offset, cursorPos.anchorNode, cursorPos.offset);
    };
}
