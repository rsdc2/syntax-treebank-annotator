var TreeEdge;
(function (TreeEdge) {
    function countEdgesToRoot(startId, tokens) {
        const _countEdgesToRoot = (id) => (count) => {
            if (id === 0)
                return 0;
            const token = TreeToken.tokenByTokenId(tokens)(id);
            if (token.isNothing)
                throw `Token with ID ${id} not found.`;
            const headToken = token
                .fmap(TreeToken.headId)
                .bind(TreeToken.tokenByTokenId(tokens));
            if (headToken.isNothing)
                // throw `Head node with ID ${headToken.fmap(TreeToken.id)} not found.`
                return 0;
            count++;
            // Undo the last action if there is a cycle
            // TODO: there is probably a better way to fix this
            if (count > 100) {
                throw Error("Recursion error");
            }
            if (headToken.fmap(TreeToken.type).eq(TreeTokenType.Root))
                return count;
            const f = flip(_countEdgesToRoot);
            return headToken
                .fmap(TreeToken.id)
                .fmap(f(count)).fromMaybe(0);
        };
        return _countEdgesToRoot(startId)(0);
    }
    TreeEdge.countEdgesToRoot = countEdgesToRoot;
})(TreeEdge || (TreeEdge = {}));
