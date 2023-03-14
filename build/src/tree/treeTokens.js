var TreeToken;
(function (TreeToken) {
    TreeToken.tokenByTokenId = (tokens) => (tokenId) => {
        const token = tokens.find((token) => token.id === tokenId);
        return MaybeT.of(token);
    };
    TreeToken.tokenIdxByTokenId = (tokens) => (tokenId) => {
        // Root node is 0
        return tokens.findIndex((token) => token.id === tokenId);
    };
    TreeToken.headId = (token) => {
        return token.headId;
    };
    TreeToken.id = (token) => {
        return token.id;
    };
    TreeToken.type = (token) => {
        return token.type;
    };
})(TreeToken || (TreeToken = {}));
