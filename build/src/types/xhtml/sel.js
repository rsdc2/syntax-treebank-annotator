class SelRange {
    constructor(anchorNode, anchorExtent, focusNode, focusExtent) {
        this.anchorNode = anchorNode;
        this.anchorExtent = anchorExtent;
        this.focusNode = focusNode;
        this.focusExtent = focusExtent;
    }
}
class CursorPos {
    constructor(node, extent) {
        this.anchorNode = node;
        this.offset = extent;
    }
}
CursorPos.of = (offset) => (anchorNode) => {
    return new CursorPos(anchorNode, offset);
};
CursorPos.ofMaybes = (node) => (extent) => {
    const f = flip(CursorPos.of);
    const nodeFunc = node.fmap(f);
    return extent.applyFmap(nodeFunc);
};
class Sel {
}
Sel.anchorNode = (sel) => {
    return MaybeT.of(sel.anchorNode);
};
Sel.anchorOffset = (sel) => {
    return sel.anchorOffset;
};
Sel.extentNode = (sel) => {
    return MaybeT.of(sel.focusNode);
};
Sel.extentOffset = (sel) => {
    return sel.focusOffset;
};
Sel.setBaseAndExtent = (selRange) => (sel) => {
    sel.setBaseAndExtent(selRange.anchorNode, selRange.anchorExtent, selRange.focusNode, selRange.focusExtent);
};
Sel.setCursorPos = (cursorPos) => (sel) => {
    sel.setBaseAndExtent(cursorPos.anchorNode, cursorPos.offset, cursorPos.anchorNode, cursorPos.offset);
};
