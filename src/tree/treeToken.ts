

namespace TreeToken {
    export const tokenByTokenId = 
        (tokens: ITreeToken[]) => 
        (tokenId: number) => 
    {
        const token = tokens.find((token) => token.id === tokenId)
        return MaybeT.of(token)
    }
    
    export const tokenIdxByTokenId = 
        (tokens: ITreeToken[]) => 
        (tokenId: number): number => 
    {
        // NB: Root node is 0
        return tokens.findIndex((token) => token.id === tokenId)
    }

    export const headId = (token: ITreeToken) => {
        return token.headId
    }

    export const id = (token: ITreeToken) => {
        return token.id
    }

    export const type = (token: ITreeToken) => {
        return token.type
    }
    
}