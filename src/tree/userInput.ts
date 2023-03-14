namespace UserInput {

    export function leftClickNodeLabel(this: SVGTextElement, e: MouseEvent): void {
        e.stopPropagation()

        const treeNodeId = HTML.Elem.getAttr ("treenode-id") (this)

        if (globalState.treeStateIO.bind(TreeStateIO.lastClickedId).value === treeNodeId.value
            && globalState.treeStateIO.fmap(TreeStateIO.lastClickType).eq(ClickType.Left)
            ) {
                globalState.treeStateIO
                    .fmap(TreeStateIO.changeClickState( ClickState.none() ))
                return
        }

        if (globalState.treeStateIO.bind(TreeStateIO.lastClickedId).isNothing) {
            globalState.treeStateIO.fmap(TreeStateIO.changeClickState(
                ClickState.of
                    (treeNodeId) 
                    (ElementType.NodeLabel)
                    (ClickType.Left)
            )
            )
            return
        }

        const changeNodeVal = treeNodeId
            .fmap(TreeStateIO.changeNodeValue ('headTreeNodeId'))

        const x = globalState.treeStateIO.applyFmap(globalState.treeStateIO
            .bind(TreeStateIO.lastClickedId)
            .applyFmap(changeNodeVal))

        globalState
            .treeStateIO
            .fmap(TreeStateIO.changeClickState ( ClickState.none() ))
    }
    
    export function rightClickNodeLabel(this: SVGTextElement, e: MouseEvent): void {
        e.preventDefault()
        e.stopPropagation()   
        
        const treeNodeId = HTML.Elem.getAttr ("treenode-id") (this)

        if (globalState.treeStateIO.bind(TreeStateIO.lastClickedId).value === treeNodeId.value) {
            globalState.treeStateIO
                .fmap(TreeStateIO.changeClickState( ClickState.none() ))
            return
        }

        if (globalState.treeStateIO.bind(TreeStateIO.lastClickedId).isNothing) {
            globalState.treeStateIO.fmap(TreeStateIO.changeClickState(
                ClickState.of
                    (treeNodeId) 
                    (ElementType.NodeLabel)
                    (ClickType.Right)
            )
            )
            return
        }

        const newRel = MaybeT.of(Constants.defaultRel)

        const makeNewSlashRel = treeNodeId
            .fmap(Str.toNum)
            .applyFmap(newRel.fmap(TreeStateIO.newSlashRel))

        const a = globalState
            .treeStateIO
            .bind(TreeStateIO.lastClickedId)
            .fmap(Str.toNum)
            .applyFmap(makeNewSlashRel)

        const x = globalState
            .treeStateIO
            .applyFmap(a)
        
        const y = globalState
            .treeStateIO
            .fmap(TreeStateIO.changeClickState (ClickState.none() ) )
    }

    export function leftClickEdgeLabel(this: HTMLDivElement, e: MouseEvent): void {
        e.stopPropagation()

        globalState
            .treeStateIO
            .fmap(
                TreeStateIO.changeClickState(
                    ClickState.of 
                        (HTML.Elem.getAttr("id")(this))
                        (ElementType.EdgeLabel)
                        (ClickType.Left)
                )
            )
    }

    export function keyDownEdgeLabel(this, e: KeyboardEvent) {

        switch (e.key) {
            case ("Enter"):
                globalState
                    .treeStateIO
                    .fmap(TreeStateIO.changeClickState( ClickState.none() ))
                break

            case ("Escape"):
                globalState
                    .treeStateIO
                    .fmap(TreeStateIO.changeClickState( ClickState.none() ))
                break

            case ("Delete"):
                const x = globalState
                    .treeStateIO
                    .applyFmap(HTML.q("div.edge-label-div.clicked")
                    .bind(HTML.Elem.getAttr("slash-id"))
                    .fmap(TreeStateIO.removeSlashBySlashIdFromTreeNodeIds))
                break
        }
    }

    export function keyDownArethusaInputTextArea(this, e: KeyboardEvent) {
        globalState.pressInputArethusaKey()
    }

    export function keyDownEpiDocInputTextArea(this, e: KeyboardEvent) {
        globalState.pressInputEpiDocKey()
    }

    export function pageDown(this, e: KeyboardEvent) {
        // switch (e.key) {
        //     case ("PageDown"):
        //         console.log("Page down")
        // }
    }

    const inputKeyEvent = (e: KeyboardEvent) => {
        if (["PageDown", "PageUp"].includes(e.key)) {
            e.preventDefault()  // Stops movement of TextArea element to the left when press keydown
            // epidocInputTextarea.insertAdjacentText(epidocInputTextarea.selectionStart, "\t")
        }
    }

    export function setTextInputKeyEvents() {
        Frontend.epidocInputTextArea
            .fmap(TextArea.setKeydownEvent(inputKeyEvent))
        Frontend.arethusaInputTextArea
            .fmap(TextArea.setKeydownEvent(inputKeyEvent))
        Frontend.textInputTextArea
            .fmap(TextArea.setKeydownEvent(inputKeyEvent))
    }

    export function setClickOutAboutBox() {
        window.onclick = (ev: MouseEvent) => {
            Frontend.hideAbout()
        }

        // Frontend.buttonById("btnAbout")
        //     .fmap(HTML.Btn.setOnclickFunc( (ev: MouseEvent) => {
        //         // ev.stopPropagation() 
        //         Frontend.toggleAbout()
        //     }))
    }
}

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

