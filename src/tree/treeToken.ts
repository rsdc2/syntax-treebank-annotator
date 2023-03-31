

namespace TreeToken {
    export const artificialType = 
        (token: ITreeToken): ArtificialType =>
    {
        if (isArtificial(token)) {
            return ArtificialType.Elliptic
        }

        return ArtificialType.None
    }

    export const headId = (token: ITreeToken) => {
        return token.headId
    }

    export const id = (token: ITreeToken) => {
        return token.id
    }

    export const insertionId = 
        (token: ITreeToken): string => 
    {
        if ('insertionId' in token) {
            return token.insertionId;
        }
        return "";
    }

    export const isArtificial = (token: ITreeToken): boolean => {
        return 'artificial' in token;
    }

    export const lemma = 
        (token: ITreeToken): string => 
    {
        if ('lemma' in token) {
            return token.lemma;
        }
        return "";
    }

    export const postag = 
        (token: ITreeToken): string => 
    {
        if ('lemma' in token) {
            return token.postag;
        }
        return "";
    }

    export const tokenByTokenId = 
        (tokens: ITreeToken[]) => 
        (tokenId: number) => 
    {
        const token = tokens.find((token) => 
            token.id === tokenId)
        return MaybeT.of(token)
    }
    
    /**
     * Returns the index location of the token in the token array
     * based on the id of the token.
     * Note: Root node is always 0
     * @param tokens 
     * @returns 
     */

    export const tokenIdxByTokenId = 
        (tokens: ITreeToken[]) => 
        (tokenId: number): number => 
    {
        return tokens.findIndex((token) => 
            token.id === tokenId)
    }

    export const type = (token: ITreeToken): TreeTokenType => {
        return token.type
    }
    
}