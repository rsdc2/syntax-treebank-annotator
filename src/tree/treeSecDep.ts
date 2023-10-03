
class SecondaryDep implements ISecondaryDep {
    _headTokenId: number
    _depTokenId: number // Secondary dependencies stored on the child
    _relation: string

    constructor (srcTokenId: number, tgtTokenId: number, relation: string) {
        this._relation = relation
        this._depTokenId = tgtTokenId
        this._headTokenId = srcTokenId
    }

    static changeRel = (newRel: AGLDTRel) => (slash: ISecondaryDep) => {
        return SecondaryDep.ofTokenIds
            (slash._headTokenId)
            (slash._depTokenId)
            (newRel)
    }

    static createIdFromTokenIds = (slash: SecondaryDep) => {
        return TreeLinks.createId 
            (LinkType.Slash)
            (slash.headTokenId) 
            (slash.depTokenId)
    } 

    static createIdFromTreeNodeIds = 
        (sentState: TreeState) => 
        (slash: SecondaryDep) => 
    {
        const headTreeNodeId = SecondaryDep.headTreeNodeId(sentState)(slash)
        const depTreeNodeId = SecondaryDep.depTreeNodeId(sentState)(slash)

        return depTreeNodeId.applyFmap(headTreeNodeId.fmap(TreeLinks.createId 
            (LinkType.Slash)))
    } 

    static createEdgeLabelIdFromTokenIds = (slash: SecondaryDep) => {
        return TreeLinks.createEdgeLabelIdFromTokenIds (slash) ("slash")
    }

    static createEdgeLabelIdFromTreeNodeIds = 
        (sentState: TreeState) => 
        (secondaryDep: SecondaryDep) => 
    {
        return TreeLinks.createEdgeLabelIdFromTreeNodeIds 
            (sentState) 
            (secondaryDep) 
            ("slash")
    }

    static createPathIdFromTokenIds = (slash: SecondaryDep) => {
        return TreeLinks.createPathIdFromTokenIds (slash) ("slash")
    }

    static createPathIdFromTreeNodeIds = 
        (sentState: TreeState) => 
        (slash: SecondaryDep) => 
    {
        return TreeLinks.createPathIdFromTreeNodeIds (sentState) (slash) ("slash")
    }

    static depTokenId = (slash: ISecondaryDep) => {
        return slash._depTokenId
    }

    get depTokenId () {
        return this._depTokenId
    }

    static depTreeNodeId = (sentState: TreeState) => (slash: ISecondaryDep) => {
        return sentState.tokenIdToTreeNodeId(slash._depTokenId)
    }

    depTreeNodeId = (sentState: TreeState) => {
        return SecondaryDep.depTreeNodeId(sentState)(this)
    }

    get edgeLabelIdFromTokenIds () {
        return SecondaryDep.createEdgeLabelIdFromTokenIds(this)
    }

    edgeLabelIdFromTreeNodeIds = (sentState: TreeState) => {
        return SecondaryDep.createEdgeLabelIdFromTreeNodeIds(sentState)(this)
    }

    get edgePathIdFromTokenIds () {
        return SecondaryDep.createPathIdFromTokenIds(this)
    }

    edgePathIdFromTreeNodeIds = (sentState: TreeState) => {
        return SecondaryDep.createPathIdFromTreeNodeIds(sentState)(this)
    }

    static headTokenId = (slash: ISecondaryDep) => {
        return slash._headTokenId
    }

    get headTokenId () {
        return this._headTokenId
    }

    static headTreeNodeId = (sentState: TreeState) => (slash: ISecondaryDep) => {
        return sentState.tokenIdToTreeNodeId(slash._headTokenId)
    }

    headTreeNodeId = (sentState: TreeState) => {
        return SecondaryDep.headTreeNodeId(sentState)(this)
    }

    get slashIdFromTokenIds () {
        return SecondaryDep.createIdFromTokenIds (this)
    }

    slashIdFromTreeNodeIds = (sentState: TreeState) => {
        return SecondaryDep.createIdFromTreeNodeIds (sentState) (this)
    }

    static parseSecDep = (s: string): [string, string] => {
        const parts = s.split(":")
        if (parts.length !== 2) {
            return ["", ""]
        }

        return [parts[0], parts[1]]
    }

    static ofStr = (depId: string) => (s: string): ISecondaryDep => {
        const [headId, rel] = SecondaryDep.parseSecDep(s)
        return {
            _headTokenId: Str.toNum(headId),
            _depTokenId: Str.toNum(depId),
            _relation: rel
        }
    }

    static ofTokenIds = 
        (headTokenId: number) => 
        (depTokenId: number) => 
        (relation: string) => 
        
        {
            return new SecondaryDep(headTokenId, depTokenId, relation)
    }

    static ofTreeNodeIds =
        (treeState: TreeState) => 
        (headTreeNodeId: number) => 
        (depTreeNodeId: number) => 
        (relation: string): Maybe<SecondaryDep> => 
    {
        const headTokenId = treeState.treeNodeIdToTokenId(headTreeNodeId)
        const depTokenId = treeState.treeNodeIdToTokenId(depTreeNodeId)

        return MaybeT.of(relation)
            .applyFmap(
                depTokenId
                    .applyFmap(
                        headTokenId.fmap(SecondaryDep.ofTokenIds)
                    )
                )
    }

    static ofInterface = (islash: ISecondaryDep) => {
        return new SecondaryDep(islash._headTokenId, islash._depTokenId, islash._relation)
    }

    get relation () {
        return this._relation
    }

    set relation (value: string) {
        this._relation = value
    }

    static relation = (slash: SecondaryDep) => {
        return slash.relation
    }

    static toStr = (iSlash: ISecondaryDep) => {
        if (MaybeT.of(iSlash._headTokenId).isNothing) {
            return ""
        }
        return `${iSlash._headTokenId}:${iSlash._relation}`
    }
    
}
