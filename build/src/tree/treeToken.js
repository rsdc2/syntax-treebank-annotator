var TreeToken;
(function (TreeToken) {
    TreeToken.artificialType = (token) => {
        if (TreeToken.isArtificial(token)) {
            return ArtificialType.Elliptic;
        }
        return ArtificialType.None;
    };
    TreeToken.headId = (token) => {
        return token.headId;
    };
    TreeToken.id = (token) => {
        return token.id;
    };
    TreeToken.isArtificial = (token) => {
        return 'artificial' in token;
    };
    TreeToken.tokenByTokenId = (tokens) => (tokenId) => {
        const token = tokens.find((token) => token.id === tokenId);
        return MaybeT.of(token);
    };
    TreeToken.tokenIdxByTokenId = (tokens) => (tokenId) => {
        // NB: Root node is 0
        return tokens.findIndex((token) => token.id === tokenId);
    };
    TreeToken.type = (token) => {
        return token.type;
    };
})(TreeToken || (TreeToken = {}));
