// Objects for representing in the tree
// Contain properties needed for D3 representation
// Plus some others to help me keep track of what is going on

interface ITreeNode {
    name: string,
    tokenId: number,
    treeNodeId: number,
    headTokenId: number,
    slashes: ISlash[],   // a slash is stored on the dependent node
    distToRoot: number,
    relation: string
    type: NodeType,
    // token: IToken | null,
    radius?: number | undefined;
    index?: number | undefined;
    /**
     * Node’s current x-position
     */
    x?: number | undefined;
    /**
     * Node’s current y-position
     */
    y?: number | undefined;
    /**
     * Node’s current x-velocity
     */
    vx?: number | undefined;
    /**
     * Node’s current y-velocity
     */
    vy?: number | undefined;
    /**
     * Node’s fixed x-position (if position was fixed)
     */
    fx?: number | null | undefined;
    /**
     * Node’s fixed y-position (if position was fixed)
     */
    fy?: number | null | undefined;
}

namespace TreeNode {

    export const appendSlash = (slash: ISlash) => (node: ITreeNode) => {
        const newNode = Obj.deepcopy(node)
        newNode.slashes = Arr.push(slash)(newNode.slashes)
        return newNode
    }

    
    export const byTokenId = (treeNodes: ITreeNode[], tokenId: number): Maybe<ITreeNode> => {
        const treeNode = treeNodes.find(
            (treeNode) => treeNode.tokenId === tokenId
        )
        return MaybeT.of(treeNode)
    }

    export const changeSlash = (slash: Slash) => (node: ITreeNode) => {
        const slashesIdx = node
            .slashes
            .findIndex( 
                (_slash: Slash) => _slash.slashIdFromTokenIds === slash.slashIdFromTokenIds
            )

        const nodeCopy = Obj.deepcopy(node)
        MaybeT.of(nodeCopy)
            .fmap(TreeNode.slashes)
            .unpackT([])
            .splice(slashesIdx, 1, slash)

        return nodeCopy
    }

    export const empty = (): ITreeNode => {
        return {
            name: "",
            tokenId: -1,
            treeNodeId: -1,
            headTokenId: -1,
            slashes: [],
            distToRoot: -1,
            relation: AGLDTRel.NONE,
            type: NodeType.None,
        }
    }

    export const headTreeNodeId = 
        (sentState: TreeState) => 
        (treeNode: ITreeNode) => 
        
        {
        return sentState.tokenIdToTreeNodeId(treeNode
            .headTokenId)
    }

    export const links = (treeNodes: ITreeNode[]) => {
        const sentState = TreeState.of(0) ("1") ([]) (treeNodes) (ClickState.none())

        function slashLinkMapFunc(acc: ITreeLink[], iSlash: ISlash) {
            const slash = Slash.ofI(iSlash)

            const headTreeNode = TreeNode.byTokenId(treeNodes, slash._headTokenId)
            const depTreeNode = TreeNode.byTokenId(treeNodes, slash._depTokenId)

            const headTreeNodeId = headTreeNode
                .fmap(TreeNode.treeNodeId)
            const depTreeNodeId = depTreeNode
                .fmap(TreeNode.treeNodeId)
            const id = depTreeNodeId.applyFmap(
                            headTreeNodeId.fmap(
                                TreeLinks.createId(LinkType.Slash)))


            if (headTreeNodeId.isNothing || depTreeNodeId.isNothing) return acc

            const link: ITreeLink = {
                id: id.unpack(""),
                target: depTreeNode.unpack(TreeNode.empty()),
                source: headTreeNode.unpack(TreeNode.empty()),
                type: LinkType.Slash,
                relation: slash._relation,
                headTreeNodeId: headTreeNodeId.unpack(-1),
                depTreeNodeId: depTreeNodeId.unpack(-1)
            }
    
            return Arr.push (link) (acc)
        }

        function mainNodeLinkReduceFunc(acc: ITreeLink[], treeNode: ITreeNode, idx: number, treeNodes: ITreeNode[]): ITreeLink[] {

            // Add slashes first so that links are created even if 
            // no main head-child relation

            const slashes: ITreeLink[] = treeNode
                .slashes
                .reduce(slashLinkMapFunc, [])

            acc = acc.concat(slashes)

            // Head-child relation

            const headTreeNode = TreeNode.byTokenId(treeNodes, treeNode.headTokenId)
            const depTreeNode = TreeNode.byTokenId(treeNodes, treeNode.tokenId)

            const headId = headTreeNode
                .fmap(TreeNode.treeNodeId)
            const depId = depTreeNode
                .fmap(TreeNode.treeNodeId)
            const id = depId.applyFmap(headId.fmap(TreeLinks.createId(LinkType.Head)))

            if (headTreeNode.isNothing) return acc
    
            const link: ITreeLink = {
                id: id.unpackT(""),
                target: treeNode,
                source: headTreeNode.unpackT(TreeNode.empty()),
                type: LinkType.Head,
                relation: treeNode.relation,
                headTreeNodeId: headId.unpackT(-1),
                depTreeNodeId: treeNode.treeNodeId 
            }

            return Arr.push (link) (acc)
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
                        node.tokenId === parseInt(tokenId))
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
    
                return parallel1 || parallel2 ? Arr.push(link) (acc) : acc
            }
        , [])
    }

    export const relation = (node: ITreeNode) => {
        return node.relation
    }

    export const removeSlashBySlashIdFromTreeNodeIds = (sentState: TreeState) => (slashId: string) => (node: ITreeNode) => {
        const newNode = Obj.deepcopy(node)
        const slashArrIdx = newNode
            .slashes
            .findIndex (
                (slash) => {
                    return Slash
                        .ofI(slash)
                        .slashIdFromTreeNodeIds(sentState)
                        .eq(slashId)
                }
        )
        newNode.slashes = Arr.removeByIdx(newNode.slashes)(slashArrIdx)
        return newNode
    }

    export const setHeadTokenId = (value: number) => (node: ITreeNode) => {
        node.headTokenId = value
    }


    export const slashByHeadId = (headId: number) => (node: ITreeNode) => {
        return MaybeT.of(node.slashes.find(
            (slash: Slash) => {
                slash.headTokenId === headId
            }
        ))
    }

    export const slashBySlashId = (slashId: string) => (node: ITreeNode) => {
        return MaybeT.of(node.slashes.find(
            (islash: ISlash) => {
                Slash.ofI(islash).slashIdFromTokenIds === slashId
            }
        ))
    }

    export const slashes = (node: ITreeNode) => {
        return node.slashes
    }

    export const slashesToStr = (node: ITreeNode) => {
        return node.slashes.map(Slash.toStr).join(";")
    }

    export const tokenToTreeNode = (token: ITreeToken, counter: number, tokens: ITreeToken[]): ITreeNode => {
        const node = {
            name: token.form,
            tokenId: token.id,
            treeNodeId: counter,
            headTokenId: token.headId,
            relation: token.relation, // === "" ? Constants.defaultRel : token.relation,
            slashes: token.slashes,
            distToRoot: TreeEdge.countEdgesToRoot(token.id, tokens),
            type: token.type === TokenType.Root ? 
                NodeType.Root : 
                NodeType.NonRoot
        }
    
        return node
    }

    export const tokenToTreeNodeFromExistingNode = (nodes: ITreeNode[]) => 
        (token: ITreeToken, counter: number, tokens: ITreeToken[]): ITreeNode => {

        const _node = TreeNode
            .nodeByTokenId
                (Str.fromNum(token.id))
                (nodes)
            .unpack(null)
        
        if (_node === null) {
            return TreeNode.tokenToTreeNode(token, counter, tokens)
        }
        
        _node.name = token.form
        _node.tokenId = token.id
        _node.treeNodeId = counter
        _node.headTokenId = token.headId
        _node.relation = token.relation
        _node.slashes = token.slashes
        _node.distToRoot = TreeEdge.countEdgesToRoot(token.id, tokens)
        _node.type = token.type === TokenType.Root ? 
            NodeType.Root : 
            NodeType.NonRoot

        return _node

    }
    
    export const tokensToTreeNodes = (tokens: ITreeToken[]): ITreeNode[] => {
        return tokens
            .map(TreeNode.tokenToTreeNode)
    }

    export const toXMLStr = (node: ITreeNode) => {
        return `<word id="${node.tokenId}" form="${node.name}" lemma="" postag="" relation="${node.relation}" head="${node.headTokenId}" secdeps="${TreeNode.slashesToStr(node)}"/>`
    }

    export const toXMLNode = (node: ITreeNode) => {
        return MaybeT.of(TreeNode
            .toXMLStr(node))
            .fmap(XML.fromXMLStr)
    }

    export const treeNodeId = (n: ITreeNode) => {
        return n.treeNodeId
    }

    export const tokenId = (n: ITreeNode) => {
        return n.tokenId
    }

}