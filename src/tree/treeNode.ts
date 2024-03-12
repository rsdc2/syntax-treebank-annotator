// Objects for representing in the tree
// Contain properties needed for D3 representation
// Plus some others to help keep track of what is going on



namespace TreeNode {

    export const appendSecondaryDep =
        (slash: ISecondaryDep) =>
            (node: ITreeNode) => {
                const newNode = Obj.deepcopy(node)
                newNode.secondaryDeps = Arr.push(slash)(newNode.secondaryDeps)
                return newNode
            }

    export const byTokenId =
        (treeNodes: ITreeNode[], tokenId: number): Maybe<ITreeNode> => {
            const treeNode = treeNodes.find(
                (treeNode) => treeNode.arethusaTokenId === tokenId
            )
            return MaybeT.of(treeNode)
        }

    export const changeSlash =
        (slash: SecondaryDep) =>
            (node: ITreeNode) => {
                const slashesIdx = node
                    .secondaryDeps
                    .findIndex(
                        (_slash: SecondaryDep) =>
                            _slash.slashIdFromTokenIds === slash.slashIdFromTokenIds
                    )

                const nodeCopy = Obj.deepcopy(node)
                MaybeT.of(nodeCopy)
                    .fmap(TreeNode.slashes)
                    .fromMaybe([])
                    .splice(slashesIdx, 1, slash)

                return nodeCopy
            }

    export const empty = (): ITreeNode => {
        return {
            name: "",
            arethusaTokenId: -1,
            treeNodeId: -1,
            headTokenId: -1,
            secondaryDeps: [],
            distToRoot: -1,
            relation: AGLDTRel.NONE,
            lemma: "",
            leiden: "",
            postag: "",
            upos: "",
            feats: "",
            insertionId: "",
            type: NodeType.None,
            artificialType: ArtificialType.None,
            corpusId: ""
        }
    }

    export const headTreeNodeId =
        (sentState: TreeState) =>
            (treeNode: ITreeNode) => {
                return sentState.tokenIdToTreeNodeId(treeNode
                    .headTokenId)
            }

    export const links = (treeNodes: ITreeNode[]) => {
        // const sentState = TreeState.of
        //     (0) 
        //     ("1") 
        //     ([]) 
        //     (treeNodes) 
        //     (ClickState.none())

        function secDepLinkMapFunc(acc: ITreeLink[], iSlash: ISecondaryDep) {
            const slash = SecondaryDep.ofInterface(iSlash)

            const headTreeNode = TreeNode
                .byTokenId(treeNodes, slash._headTokenId)
            const depTreeNode = TreeNode
                .byTokenId(treeNodes, slash._depTokenId)

            const headTreeNodeId = headTreeNode
                .fmap(TreeNode.treeNodeId)
            const depTreeNodeId = depTreeNode
                .fmap(TreeNode.treeNodeId)
            const id = depTreeNodeId.applyFmap(
                headTreeNodeId.fmap(
                    TreeLinks.createId(LinkType.Slash)))


            if (headTreeNodeId.isNothing || depTreeNodeId.isNothing)
                return acc;

            const link: ITreeLink = {
                id: id.unpack(""),
                target: depTreeNode.unpack(TreeNode.empty()),
                source: headTreeNode.unpack(TreeNode.empty()),
                type: LinkType.Slash,
                relation: slash._relation,
                headTreeNodeId: headTreeNodeId.unpack(-1),
                depTreeNodeId: depTreeNodeId.unpack(-1)
            }

            return Arr.push(link)(acc)
        }

        function mainNodeLinkReduceFunc(
            acc: ITreeLink[],
            treeNode: ITreeNode,
            idx: number,
            treeNodes: ITreeNode[]): ITreeLink[] {

            // Add slashes first so that links are created even if 
            // no main head-child relation

            const slashes: ITreeLink[] = treeNode
                .secondaryDeps
                .reduce(secDepLinkMapFunc, [])

            acc = acc.concat(slashes)

            // Head-child relation

            const headTreeNode = TreeNode
                .byTokenId(treeNodes, treeNode.headTokenId)
            const depTreeNode = TreeNode
                .byTokenId(treeNodes, treeNode.arethusaTokenId)

            const headId = headTreeNode
                .fmap(TreeNode.treeNodeId)
            const depId = depTreeNode
                .fmap(TreeNode.treeNodeId)
            const id = depId.applyFmap(
                headId.fmap(
                    TreeLinks.createId(LinkType.Head)
                )
            )

            if (headTreeNode.isNothing) return acc;

            const link: ITreeLink = {
                id: id.fromMaybe(""),
                target: treeNode,
                source: headTreeNode.fromMaybe(TreeNode.empty()),
                type: LinkType.Head,
                relation: treeNode.relation,
                headTreeNodeId: headId.fromMaybe(-1),
                depTreeNodeId: treeNode.treeNodeId
            }

            return Arr.push(link)(acc)
        }

        const links = treeNodes
            .reduce(mainNodeLinkReduceFunc, [])

        return links
    }

    export const nodeByTokenId = (tokenId: string) => (nodes: ITreeNode[]) => {
        return MaybeT.of(
            nodes
                .find(
                    (node: ITreeNode) =>
                        node.arethusaTokenId === parseInt(tokenId))
        )
    }


    /**
     * In order that links do not overlap, it is important to find nodes joined by multiple links.
     * This function returns an array of parallel links, which is a subset of all the links.
     */

    export const parallelLinks = (
        links: ITreeLink[],
        sourceIdx: number,
        targetIdx: number): ITreeLink[] => {

        return links.reduce(
            (acc: ITreeLink[], link: ITreeLink) => {
                const parallel1 = sourceIdx === link.headTreeNodeId
                    && targetIdx === link.depTreeNodeId
                const parallel2 = targetIdx === link.headTreeNodeId
                    && sourceIdx === link.depTreeNodeId

                return parallel1 || parallel2 ? Arr.push(link)(acc) : acc
            }
            , [])
    }

    export const relation = (node: ITreeNode) => {
        return node.relation
    }

    export const removeSlashBySlashIdFromTreeNodeIds = (sentState: TreeState) => (slashId: string) => (node: ITreeNode) => {
        const newNode = Obj.deepcopy(node)
        const slashArrIdx = newNode
            .secondaryDeps
            .findIndex(
                (slash) => {
                    return SecondaryDep
                        .ofInterface(slash)
                        .slashIdFromTreeNodeIds(sentState)
                        .eq(slashId)
                }
            )
        newNode.secondaryDeps = Arr.removeByIdx(newNode.secondaryDeps)(slashArrIdx)
        return newNode
    }

    export const setHeadTokenId = (value: number) => (node: ITreeNode) => {
        node.headTokenId = value
    }


    export const slashByHeadId = (headId: number) => (node: ITreeNode) => {
        return MaybeT.of(node.secondaryDeps.find(
            (slash: SecondaryDep) => {
                slash.headTokenId === headId
            }
        ))
    }

    export const slashBySlashId = (slashId: string) => (node: ITreeNode) => {
        return MaybeT.of(node.secondaryDeps.find(
            (islash: ISecondaryDep) => {
                SecondaryDep.ofInterface(islash).slashIdFromTokenIds === slashId
            }
        ))
    }

    export const slashes = (node: ITreeNode) => {
        return node.secondaryDeps
    }

    export const slashesToStr = (node: ITreeNode) => {
        const s = node
            .secondaryDeps
            .map(SecondaryDep.toStr)
            .join(";")

        // If secondary deps have no string representation, 
        // can end up with empty strings at the start
        // This code removes the resulting initial ';'
        if (s.charAt(0) === ";") {
            return Str.substring(1)(s.length)(s)
        }
        return s
    }

    /**
     * Converts a TreeToken to a TreeNode
     * @param token 
     * @param counter 
     * @param tokens 
     * @returns 
     */

    export const tokenToTreeNode = (
        token: ITreeToken,
        counter: number,
        tokens: ITreeToken[]): ITreeNode => {
        const node = {
            name: token.form,
            arethusaTokenId: token.id,
            treeNodeId: counter,
            headTokenId: token.headId,
            relation: token.relation,
            leiden: token.leiden,
            lemma: TreeToken.lemma(token),
            postag: TreeToken.postag(token),
            upos: TreeToken.upos(token),
            feats: TreeToken.feats(token),
            secondaryDeps: token.secondaryDeps,
            distToRoot: TreeEdge.countEdgesToRoot(token.id, tokens),
            insertionId: TreeToken.insertionId(token),
            type: token.type === TreeTokenType.Root ?
                NodeType.Root :
                NodeType.NonRoot,
            artificialType: TreeToken.artificialType(token),
            corpusId: token.corpusId
        }

        return node
    }

    export const tokenToTreeNodeFromExistingNode =
        (nodes: ITreeNode[]) =>
            (
                token: ITreeToken | ITreeWord | ITreeArtificial,
                counter: number,
                tokens: ITreeToken[]
            ): ITreeNode => {
                const _node = TreeNode
                    .nodeByTokenId
                    (Str.fromNum(token.id))
                    (nodes)
                    .unpack(null)

                if (_node === null) {
                    return TreeNode.tokenToTreeNode(token, counter, tokens)
                }

                _node.name = token.form
                _node.arethusaTokenId = token.id
                _node.treeNodeId = counter
                _node.headTokenId = token.headId
                _node.relation = token.relation
                _node.secondaryDeps = token.secondaryDeps
                _node.distToRoot = TreeEdge.countEdgesToRoot(token.id, tokens)
                _node.type = token.type === TreeTokenType.Root ?
                    NodeType.Root :
                    NodeType.NonRoot;
                _node.artificialType = TreeToken.artificialType(token)

                return _node

            }

    export const tokensToTreeNodes =
        (tokens: ITreeToken[]): ITreeNode[] => {
            return tokens
                .map(TreeNode.tokenToTreeNode)
        }

    export const toArethusaWordXMLStr = (node: ITreeNode): string => {
        if (node.artificialType == ArtificialType.Elliptic) {
            return `<word id="${node.arethusaTokenId}" 
                    form="${node.name}" 
                    leiden="${node.leiden}" 
                    artificial="${node.artificialType}" 
                    insertion_id="${node.insertionId}" 
                    relation="${node.relation}" 
                    head="${node.headTokenId}" 
                    secdeps="${TreeNode.slashesToStr(node)}"
                    corpusId="${node.corpusId === undefined ? "" : node.corpusId}"
                    />`
        }
        return `<word id="${node.arethusaTokenId}" 
                form="${node.name}" 
                leiden="${node.leiden}" 
                lemma="${node.lemma}" 
                postag="${node.postag}" 
                upos="${node.upos}"
                feats="${node.feats}"
                relation="${node.relation}" 
                head="${node.headTokenId}" 
                secdeps="${TreeNode.slashesToStr(node)}"
                corpusId="${node.corpusId === undefined ? "" : node.corpusId}"
                />`
    }

    export const toXMLNode = (node: ITreeNode) => {
        return MaybeT.of(TreeNode
            .toArethusaWordXMLStr(node))
            .fmap(XML.fromXMLStr)
    }

    export const treeNodeId = (n: ITreeNode) => {
        return n.treeNodeId
    }

    export const tokenId = (n: ITreeNode) => {
        return n.arethusaTokenId
    }

}