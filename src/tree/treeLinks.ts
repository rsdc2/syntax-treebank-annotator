enum LinkType {
    Head = "head",
    Slash = "slash",
    Unknown = "unknown"
}

enum ArcType {
    Straight = "straight",
    Curved = "curved"
}

interface ITreeLink {
    id: string,
    source: ITreeNode,
    target: ITreeNode,
    type: LinkType,
    relation: string,
    headTreeNodeId: number,
    depTreeNodeId: number
}

namespace TreeLinks {
    export const createId = 
        (edgeType: string) =>
        (srcIdx: number) => 
        (tgtIdx: number) => 
        {

        return `s${srcIdx}t${tgtIdx}-${edgeType}`
    } 

    export const createEdgeLabelIdFromTokenIds = (slash: Slash) => (edgeType: string) => {
        return `edl-${Slash.createIdFromTokenIds(slash)}-${edgeType}`
    }

    export const createPathIdFromTokenIds = (slash: Slash) => (edgeType: string) => {
        return `edg-${Slash.createIdFromTokenIds(slash)}-${edgeType}`
    }

    export const createEdgeLabelIdFromTreeNodeIds = (sentState: TreeState) => (slash: Slash) => (edgeType: string) => {
        return `edl-${Slash.createIdFromTreeNodeIds(sentState)(slash)}-${edgeType}`
    }

    export const createPathIdFromTreeNodeIds = (sentState: TreeState) => (slash: Slash) => (edgeType: string) => {
        return `edg-${Slash.createIdFromTreeNodeIds(sentState)(slash)}-${edgeType}`
    }

}