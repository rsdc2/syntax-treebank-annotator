var UserInput;
(function (UserInput) {
    UserInput.leftClickNodeLabelFunc = (treeNodeId) => {
        if (globalState.treeStateIO.bind(TreeStateIO.lastClickedId).value === treeNodeId.value
            && globalState.treeStateIO.fmap(TreeStateIO.lastClickType).eq(ClickType.Left)) {
            globalState.treeStateIO
                .fmap(TreeStateIO.changeClickState(ClickState.none()));
            return;
        }
        if (globalState.treeStateIO.bind(TreeStateIO.lastClickedId).isNothing) {
            // Change the clicked node on the tree
            globalState
                .treeStateIO
                .fmap(TreeStateIO.changeClickState(ClickState.of(treeNodeId)(TreeLabelType.NodeLabel)(ClickType.Left)));
            // Change the selected word on the output Arethusa
            const getWordId = treeNodeId
                .fmap(Str.toNum)
                .fmap(TreeState.treeNodeIdToTokenId);
            const wordId = globalState
                .treeStateIO
                .fmap(TreeStateIO.currentSentState)
                .applyBind(getWordId)
                .fmap(Str.fromNum);
            //  Change the view
            globalState
                .textStateIO
                .fmap(TextStateIO.changeView(wordId)(Nothing.of()));
            return;
        }
        const changeNodeVal = treeNodeId
            .fmap(TreeStateIO.changeNodeValue('headTreeNodeId'));
        const x = globalState.treeStateIO.applyFmap(globalState
            .treeStateIO
            .bind(TreeStateIO.lastClickedId)
            .applyFmap(changeNodeVal));
        globalState
            .treeStateIO
            .fmap(TreeStateIO.changeClickState(ClickState.none()));
    };
    function leftClickNodeLabel(e) {
        e.stopPropagation();
        const treeNodeId = HTML.Elem.getAttr("treenode-id")(this);
        UserInput.leftClickNodeLabelFunc(treeNodeId);
    }
    UserInput.leftClickNodeLabel = leftClickNodeLabel;
    function rightClickNodeLabel(e) {
        e.preventDefault();
        e.stopPropagation();
        const treeNodeId = HTML.Elem.getAttr("treenode-id")(this);
        if (globalState.treeStateIO.bind(TreeStateIO.lastClickedId).value === treeNodeId.value) {
            globalState.treeStateIO.fmap(TreeStateIO.changeClickState(ClickState.none()));
            return;
        }
        if (globalState.treeStateIO.bind(TreeStateIO.lastClickedId).isNothing) {
            // Change selected node on the tree
            globalState
                .treeStateIO
                .fmap(TreeStateIO.changeClickState(ClickState.of(treeNodeId)(TreeLabelType.NodeLabel)(ClickType.Right)));
            // Change the selected word on the output Arethusa
            const getWordId = treeNodeId
                .fmap(Str.toNum)
                .fmap(TreeState.treeNodeIdToTokenId);
            const wordId = globalState
                .treeStateIO
                .fmap(TreeStateIO.currentSentState)
                .applyBind(getWordId)
                .fmap(Str.fromNum);
            //  Change the view
            globalState
                .textStateIO
                .fmap(TextStateIO.changeView(wordId)(Nothing.of()));
            return;
        }
        const newRel = MaybeT.of(Constants.defaultRel);
        const makeNewSlashRel = treeNodeId
            .fmap(Str.toNum)
            .applyFmap(newRel.fmap(TreeStateIO.newSlashRel));
        const a = globalState
            .treeStateIO
            .bind(TreeStateIO.lastClickedId)
            .fmap(Str.toNum)
            .applyFmap(makeNewSlashRel);
        const x = globalState
            .treeStateIO
            .applyFmap(a);
        const y = globalState
            .treeStateIO
            .fmap(TreeStateIO.changeClickState(ClickState.none()));
    }
    UserInput.rightClickNodeLabel = rightClickNodeLabel;
    function leftClickEdgeLabel(e) {
        e.stopPropagation();
        globalState
            .treeStateIO
            .fmap(TreeStateIO.changeClickState(ClickState.of(HTML.Elem.getAttr("id")(this))(TreeLabelType.EdgeLabel)(ClickType.Left)));
    }
    UserInput.leftClickEdgeLabel = leftClickEdgeLabel;
    function keyDownEdgeLabel(e) {
        switch (e.key) {
            case ("Enter"):
                globalState
                    .treeStateIO
                    .fmap(TreeStateIO.changeClickState(ClickState.none()));
                break;
            case ("Escape"):
                globalState
                    .treeStateIO
                    .fmap(TreeStateIO.changeClickState(ClickState.none()));
                break;
            case ("Delete"):
                const x = globalState
                    .treeStateIO
                    .applyFmap(HTML.q("div.edge-label-div.clicked")
                    .bind(HTML.Elem.getAttr("slash-id"))
                    .fmap(TreeStateIO.removeSlashBySlashIdFromTreeNodeIds));
                break;
        }
    }
    UserInput.keyDownEdgeLabel = keyDownEdgeLabel;
    // export function keyDownArethusaInputTextArea(this, e: KeyboardEvent) {
    //     globalState.pressInputArethusaKey()
    // }
    // export function keyDownEpiDocInputTextArea(this, e: KeyboardEvent) {
    //     globalState.pressInputEpiDocKey()
    // }
    function pageDown(e) {
        // switch (e.key) {
        //     case ("PageDown"):
        //         console.log("Page down")
        // }
    }
    UserInput.pageDown = pageDown;
    const inputKeyEvent = (e) => {
        if (["PageDown", "PageUp"].includes(e.key)) {
            e.preventDefault(); // Stops movement of TextArea element to the left when press keydown
            // epidocInputTextarea.insertAdjacentText(epidocInputTextarea.selectionStart, "\t")
        }
    };
    function setTextInputKeyEvents() {
        Frontend.epidocInputTextArea
            .fmap(TextArea.setKeydownEvent(inputKeyEvent));
        Frontend.arethusaInputTextArea
            .fmap(TextArea.setKeydownEvent(inputKeyEvent));
        Frontend.textInputTextArea
            .fmap(TextArea.setKeydownEvent(inputKeyEvent));
    }
    UserInput.setTextInputKeyEvents = setTextInputKeyEvents;
    function setClickOutMessageBox() {
        window.onclick = (ev) => {
            ev.stopPropagation();
            console.log("window click");
            Frontend.hideAbout();
        };
    }
    UserInput.setClickOutMessageBox = setClickOutMessageBox;
})(UserInput || (UserInput = {}));
// window.onkeydown = ( 
//     (e: KeyboardEvent) =>{
//         UserInput.pageDown(e)
//     })
// const arethusaInputTextarea = Frontend.arethusaInputTextArea.value
// if (arethusaInputTextarea !== null) {
//     arethusaInputTextarea.onkeydown = (
//         (e: KeyboardEvent) => {
//             globalState.pressInputArethusaKey()
//         }   
//     )
// }
