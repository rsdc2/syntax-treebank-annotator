var TreeToken;
(function (TreeToken) {
    TreeToken.artificialType = (token) => {
        if (TreeToken.isArtificial(token)) {
            return ArtificialType.Elliptic;
        }
        return ArtificialType.None;
    };
    TreeToken.feats = (token) => {
        if ('feats' in token) {
            return token.feats;
        }
        return "";
    };
    TreeToken.headId = (token) => {
        return token.headId;
    };
    TreeToken.id = (token) => {
        return token.id;
    };
    TreeToken.insertionId = (token) => {
        if ('insertionId' in token) {
            return token.insertionId;
        }
        return "";
    };
    TreeToken.isArtificial = (token) => {
        return 'artificial' in token;
    };
    TreeToken.lemma = (token) => {
        if ('lemma' in token) {
            return token.lemma;
        }
        return "";
    };
    TreeToken.postag = (token) => {
        if ('lemma' in token) {
            return token.postag;
        }
        return "";
    };
    TreeToken.tokenByTokenId = (tokens) => (tokenId) => {
        const token = tokens.find((token) => token.id === tokenId);
        return MaybeT.of(token);
    };
    /**
     * Returns the index location of the token in the token array
     * based on the id of the token.
     * Note: Root node is always 0
     * @param tokens
     * @returns
     */
    TreeToken.tokenIdxByTokenId = (tokens) => (tokenId) => {
        return tokens.findIndex((token) => token.id === tokenId);
    };
    TreeToken.type = (token) => {
        return token.type;
    };
})(TreeToken || (TreeToken = {}));
