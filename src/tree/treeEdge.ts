namespace TreeEdge {

    export function countEdgesToRoot(startId: number, tokens: ITreeToken[]): number {

        const _countEdgesToRoot = (id: number) => (count: number): number => {
            if (id === 0) return 0

            const token = TreeToken.tokenByTokenId(tokens) (id)
            if (token.isNothing) 
                throw `Token with ID ${id} not found.`

            const headToken = token
                .fmap(TreeToken.headId)
                .bind(TreeToken.tokenByTokenId(tokens) )

            if (headToken.isNothing) 
                // throw `Head node with ID ${headToken.fmap(TreeToken.id)} not found.`
                return 0

            count++; 
            if (count > 100) 
                throw "Maximum recursion depth exceeded."

            if (headToken.fmap(TreeToken.type).eq(TreeTokenType.Root)) return count

            const f = flip(_countEdgesToRoot)

            return headToken
                .fmap(TreeToken.id)
                .fmap(f(count)).fromMaybe(0) 
        }

        return _countEdgesToRoot (startId) (0)
    }

}