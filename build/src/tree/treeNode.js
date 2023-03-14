// Objects for representing in the tree
// Contain properties needed for D3 representation
// Plus some others to help me keep track of what is going on
var TreeNode;
(function (TreeNode) {
    TreeNode.appendSlash = (slash) => (node) => {
        const newNode = Obj.deepcopy(node);
        newNode.slashes = Arr.push(slash)(newNode.slashes);
        return newNode;
    };
    TreeNode.byTokenId = (treeNodes, tokenId) => {
        const treeNode = treeNodes.find((treeNode) => treeNode.tokenId === tokenId);
        return MaybeT.of(treeNode);
    };
    TreeNode.changeSlash = (slash) => (node) => {
        const slashesIdx = node
            .slashes
            .findIndex((_slash) => _slash.slashIdFromTokenIds === slash.slashIdFromTokenIds);
        const nodeCopy = Obj.deepcopy(node);
        MaybeT.of(nodeCopy)
            .fmap(TreeNode.slashes)
            .unpackT([])
            .splice(slashesIdx, 1, slash);
        return nodeCopy;
    };
    TreeNode.empty = () => {
        return {
            name: "",
            tokenId: -1,
            treeNodeId: -1,
            headTokenId: -1,
            slashes: [],
            distToRoot: -1,
            relation: AGLDTRel.NONE,
            type: NodeType.None,
        };
    };
    TreeNode.headTreeNodeId = (sentState) => (treeNode) => {
        return sentState.tokenIdToTreeNodeId(treeNode
            .headTokenId);
    };
    TreeNode.links = (treeNodes) => {
        const sentState = TreeState.of(0)("1")([])(treeNodes)(ClickState.none());
        function slashLinkMapFunc(acc, iSlash) {
            const slash = Slash.ofI(iSlash);
            const headTreeNode = TreeNode.byTokenId(treeNodes, slash._headTokenId);
            const depTreeNode = TreeNode.byTokenId(treeNodes, slash._depTokenId);
            const headTreeNodeId = headTreeNode
                .fmap(TreeNode.treeNodeId);
            const depTreeNodeId = depTreeNode
                .fmap(TreeNode.treeNodeId);
            const id = depTreeNodeId.applyFmap(headTreeNodeId.fmap(TreeLinks.createId(LinkType.Slash)));
            if (headTreeNodeId.isNothing || depTreeNodeId.isNothing)
                return acc;
            const link = {
                id: id.unpack(""),
                target: depTreeNode.unpack(TreeNode.empty()),
                source: headTreeNode.unpack(TreeNode.empty()),
                type: LinkType.Slash,
                relation: slash._relation,
                headTreeNodeId: headTreeNodeId.unpack(-1),
                depTreeNodeId: depTreeNodeId.unpack(-1)
            };
            return Arr.push(link)(acc);
        }
        function mainNodeLinkReduceFunc(acc, treeNode, idx, treeNodes) {
            // Add slashes first so that links are created even if 
            // no main head-child relation
            const slashes = treeNode
                .slashes
                .reduce(slashLinkMapFunc, []);
            acc = acc.concat(slashes);
            // Head-child relation
            const headTreeNode = TreeNode.byTokenId(treeNodes, treeNode.headTokenId);
            const depTreeNode = TreeNode.byTokenId(treeNodes, treeNode.tokenId);
            const headId = headTreeNode
                .fmap(TreeNode.treeNodeId);
            const depId = depTreeNode
                .fmap(TreeNode.treeNodeId);
            const id = depId.applyFmap(headId.fmap(TreeLinks.createId(LinkType.Head)));
            if (headTreeNode.isNothing)
                return acc;
            const link = {
                id: id.unpackT(""),
                target: treeNode,
                source: headTreeNode.unpackT(TreeNode.empty()),
                type: LinkType.Head,
                relation: treeNode.relation,
                headTreeNodeId: headId.unpackT(-1),
                depTreeNodeId: treeNode.treeNodeId
            };
            return Arr.push(link)(acc);
        }
        const links = treeNodes
            .reduce(mainNodeLinkReduceFunc, []);
        return links;
    };
    TreeNode.nodeByTokenId = (tokenId) => (nodes) => {
        return MaybeT.of(nodes
            .find((node) => node.tokenId === parseInt(tokenId)));
    };
    /**
     * In order that links do not overlap, it is important to find nodes joined by multiple links.
     * This function returns an array of parallel links, which is a subset of all the links.
     */
    TreeNode.parallelLinks = (links, sourceIdx, targetIdx) => {
        return links.reduce((acc, link) => {
            const parallel1 = sourceIdx === link.headTreeNodeId
                && targetIdx === link.depTreeNodeId;
            const parallel2 = targetIdx === link.headTreeNodeId
                && sourceIdx === link.depTreeNodeId;
            return parallel1 || parallel2 ? Arr.push(link)(acc) : acc;
        }, []);
    };
    TreeNode.relation = (node) => {
        return node.relation;
    };
    TreeNode.removeSlashBySlashIdFromTreeNodeIds = (sentState) => (slashId) => (node) => {
        const newNode = Obj.deepcopy(node);
        const slashArrIdx = newNode
            .slashes
            .findIndex((slash) => {
            return Slash
                .ofI(slash)
                .slashIdFromTreeNodeIds(sentState)
                .eq(slashId);
        });
        newNode.slashes = Arr.removeByIdx(newNode.slashes)(slashArrIdx);
        return newNode;
    };
    TreeNode.setHeadTokenId = (value) => (node) => {
        node.headTokenId = value;
    };
    TreeNode.slashByHeadId = (headId) => (node) => {
        return MaybeT.of(node.slashes.find((slash) => {
            slash.headTokenId === headId;
        }));
    };
    TreeNode.slashBySlashId = (slashId) => (node) => {
        return MaybeT.of(node.slashes.find((islash) => {
            Slash.ofI(islash).slashIdFromTokenIds === slashId;
        }));
    };
    TreeNode.slashes = (node) => {
        return node.slashes;
    };
    TreeNode.slashesToStr = (node) => {
        return node.slashes.map(Slash.toStr).join(";");
    };
    TreeNode.tokenToTreeNode = (token, counter, tokens) => {
        const node = {
            name: token.form,
            tokenId: token.id,
            treeNodeId: counter,
            headTokenId: token.headId,
            relation: token.relation,
            slashes: token.slashes,
            distToRoot: TreeEdge.countEdgesToRoot(token.id, tokens),
            type: token.type === TokenType.Root ?
                NodeType.Root :
                NodeType.NonRoot
        };
        return node;
    };
    TreeNode.tokenToTreeNodeFromExistingNode = (nodes) => (token, counter, tokens) => {
        const _node = TreeNode
            .nodeByTokenId(Str.fromNum(token.id))(nodes)
            .unpack(null);
        if (_node === null) {
            return TreeNode.tokenToTreeNode(token, counter, tokens);
        }
        _node.name = token.form;
        _node.tokenId = token.id;
        _node.treeNodeId = counter;
        _node.headTokenId = token.headId;
        _node.relation = token.relation;
        _node.slashes = token.slashes;
        _node.distToRoot = TreeEdge.countEdgesToRoot(token.id, tokens);
        _node.type = token.type === TokenType.Root ?
            NodeType.Root :
            NodeType.NonRoot;
        return _node;
    };
    TreeNode.tokensToTreeNodes = (tokens) => {
        return tokens
            .map(TreeNode.tokenToTreeNode);
    };
    TreeNode.toXMLStr = (node) => {
        return `<word id="${node.tokenId}" form="${node.name}" lemma="" postag="" relation="${node.relation}" head="${node.headTokenId}" secdeps="${TreeNode.slashesToStr(node)}"/>`;
    };
    TreeNode.toXMLNode = (node) => {
        return MaybeT.of(TreeNode
            .toXMLStr(node))
            .fmap(XML.fromXMLStr);
    };
    TreeNode.treeNodeId = (n) => {
        return n.treeNodeId;
    };
    TreeNode.tokenId = (n) => {
        return n.tokenId;
    };
})(TreeNode || (TreeNode = {}));
