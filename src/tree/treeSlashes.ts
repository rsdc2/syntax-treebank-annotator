interface ISecondaryDep {
    _headTokenId: number
    _depTokenId: number
    _relation: string
}

class Slash implements ISecondaryDep {
    _headTokenId: number
    _depTokenId: number // Slashes stored on the child
    _relation: string

    constructor (srcTokenId: number, tgtTokenId: number, relation: string) {
        this._relation = relation
        this._depTokenId = tgtTokenId
        this._headTokenId = srcTokenId
    }

    static changeRel = (newRel: AGLDTRel) => (slash: ISecondaryDep) => {
        return Slash.ofTokenIds
            (slash._headTokenId)
            (slash._depTokenId)
            (newRel)
    }

    static createIdFromTokenIds = (slash: Slash) => {
        return TreeLinks.createId 
            (LinkType.Slash)
            (slash.headTokenId) 
            (slash.depTokenId)
    } 

    static createIdFromTreeNodeIds = (sentState: TreeState) => (slash: Slash) => {
        const headTreeNodeId = Slash.headTreeNodeId(sentState)(slash)
        const depTreeNodeId = Slash.depTreeNodeId(sentState)(slash)

        return depTreeNodeId.applyFmap(headTreeNodeId.fmap(TreeLinks.createId 
            (LinkType.Slash)))
    } 

    static createEdgeLabelIdFromTokenIds = (slash: Slash) => {
        return TreeLinks.createEdgeLabelIdFromTokenIds (slash) ("slash")
    }

    static createEdgeLabelIdFromTreeNodeIds = (sentState: TreeState) => (slash: Slash) => {
        return TreeLinks.createEdgeLabelIdFromTreeNodeIds (sentState) (slash) ("slash")
    }

    static createPathIdFromTokenIds = (slash: Slash) => {
        return TreeLinks.createPathIdFromTokenIds (slash) ("slash")
    }

    static createPathIdFromTreeNodeIds = (sentState: TreeState) => (slash: Slash) => {
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
        return Slash.depTreeNodeId(sentState)(this)
    }

    get edgeLabelIdFromTokenIds () {
        return Slash.createEdgeLabelIdFromTokenIds(this)
    }

    edgeLabelIdFromTreeNodeIds = (sentState: TreeState) => {
        return Slash.createEdgeLabelIdFromTreeNodeIds(sentState)(this)
    }

    get edgePathIdFromTokenIds () {
        return Slash.createPathIdFromTokenIds(this)
    }

    edgePathIdFromTreeNodeIds = (sentState: TreeState) => {
        return Slash.createPathIdFromTreeNodeIds(sentState)(this)
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
        return Slash.headTreeNodeId(sentState)(this)
    }

    get slashIdFromTokenIds () {
        return Slash.createIdFromTokenIds (this)
    }

    slashIdFromTreeNodeIds = (sentState: TreeState) => {
        return Slash.createIdFromTreeNodeIds (sentState) (this)
    }

    static parseSecDep = (s: string): [string, string] => {
        const parts = s.split(":")
        if (parts.length !== 2) {
            return ["", ""]
        }

        return [parts[0], parts[1]]
    }

    static ofStr = (depId: string) => (s: string): ISecondaryDep => {
        const [headId, rel] = Slash.parseSecDep(s)
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
            return new Slash(headTokenId, depTokenId, relation)
    }

    static ofTreeNodeIds =
        (sentState: TreeState) => 
        (headTreeNodeId: number) => 
        (depTreeNodeId: number) => 
        (relation: string) => 
    
        {
            const headTokenId = sentState.treeNodeIdToTokenId(headTreeNodeId)
            const depTokenId = sentState.treeNodeIdToTokenId(depTreeNodeId)

            return MaybeT.of(relation).applyFmap(depTokenId.applyFmap(headTokenId.fmap(Slash.ofTokenIds)))
    }

    static ofI = (islash: ISecondaryDep) => {
        return new Slash(islash._headTokenId, islash._depTokenId, islash._relation)
    }

    get relation () {
        return this._relation
    }

    set relation (value: string) {
        this._relation = value
    }

    static relation = (slash: Slash) => {
        return slash.relation
    }

    static toStr = (iSlash: ISecondaryDep) => {
        return `${iSlash._headTokenId}:${iSlash._relation}`
    }
    
}
