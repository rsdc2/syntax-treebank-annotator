enum LinkType {
    Head = "head",
    Slash = "slash",
    Unknown = "unknown"
}

enum ArcType {
    Straight = "straight",
    Curved = "curved"
}



namespace TreeLinks {
    export const createId = 
        (edgeType: string) =>
        (srcIdx: number) => 
        (tgtIdx: number) => 
        {

        return `s${srcIdx}t${tgtIdx}-${edgeType}`
    } 

    export const createEdgeLabelIdFromTokenIds = (slash: SecondaryDep) => (edgeType: string) => {
        return `edl-${SecondaryDep.createIdFromTokenIds(slash)}-${edgeType}`
    }

    export const createPathIdFromTokenIds = (slash: SecondaryDep) => (edgeType: string) => {
        return `edg-${SecondaryDep.createIdFromTokenIds(slash)}-${edgeType}`
    }

    export const createEdgeLabelIdFromTreeNodeIds = (sentState: TreeState) => (slash: SecondaryDep) => (edgeType: string) => {
        return `edl-${SecondaryDep.createIdFromTreeNodeIds(sentState)(slash)}-${edgeType}`
    }

    export const createPathIdFromTreeNodeIds = (sentState: TreeState) => (slash: SecondaryDep) => (edgeType: string) => {
        return `edg-${SecondaryDep.createIdFromTreeNodeIds(sentState)(slash)}-${edgeType}`
    }

}