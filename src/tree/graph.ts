
// For the approach of adopting a downward graph to represent the syntax tree
// cf. https://stackoverflow.com/questions/21529242/d3-force-directed-graph-downward-force-simulation/21537377

namespace Graph {

    let container, start, end
    const alphaTarget = 0.5
    const simDurationMs = 1000; 
    const linkDistance = 60;
    const linkStrength = 0.3;
    const xStrength = 0.25;
    const yStrength = 0.25;
    const collisionStrength = 0.1;
    const manyBodyStrength = -600;
    const xMult = 20;
    const yMult = 50;

    export const circles = () => {
        const circles = document.querySelectorAll("circle")
        const circleArr = new Array<SVGCircleElement>()
        circles.forEach ( (item: SVGCircleElement) => {
            circleArr.push(item)
        })
        return circleArr
    }    

    export function clearGraph(): void {
        d3
            .select("g")
            .selectAll('*')
            .remove()
    }

    export const clickCircle = (tokenId: string) =>  {
        const clickState = ClickState.of(MaybeT.of(tokenId))(TreeLabelType.NodeLabel)(ClickType.Left)
        globalState.treeStateIO.fmap(TreeStateIO.changeClickState(clickState))
    }
    
    function resetClock() {
        // for this solution for stopping clock, cf. 
        // https://stackoverflow.com/questions/23334366/how-to-stop-force-directed-graph-simulation @ Jaret Meyer

        start = Date.now();
        end = start + simDurationMs;
    }

    function handleDrag(event, d: ITreeNode) {
    
        function duringDrag(event, d: ITreeNode) {
            // Fix the circle until the drag has finished
            const svgElem = HTML.q("svg").value as SVGGraphicsElement | null
            if (svgElem !== null) {
                const viewBoxW = SVG.ViewBox.getViewBoxValFromSVGElem(2)(svgElem).unpackT(0)
                const viewBoxH = SVG.ViewBox.getViewBoxValFromSVGElem(3)(svgElem).unpackT(0)
                const viewBoxX = SVG.ViewBox.getViewBoxValFromSVGElem(0)(svgElem).unpackT(0)
                const viewBoxY = SVG.ViewBox.getViewBoxValFromSVGElem(1)(svgElem).unpackT(0)
                const xRat = viewBoxW / svgElem.clientWidth
                const yRat = viewBoxH / svgElem.clientHeight 
                const clientX = event.sourceEvent.clientX
                const clientY = event.sourceEvent.clientY
                const mouseX = clientX - svgElem.getBoundingClientRect().left
                const mouseY = clientY - svgElem.getBoundingClientRect().top
                const mouseSVGX = mouseX * xRat + viewBoxX
                const mouseSVGY = mouseY * yRat + viewBoxY
                d.fx = mouseSVGX 
                d.fy = mouseSVGY
            }

            resetClock();
            
            globalState.simulation.nodes(globalState
                .treeStateIO
                .fmap(TreeStateIO.nodes)
                .unpackT([])
            )
            
            globalState.simulation
                .alphaTarget(alphaTarget)
                .restart();
        }
    
        function endDrag(event, d: ITreeNode) {
            delete d.fx;
            delete d.fy;
        }
    
        function startDrag(event, d: ITreeNode) {
            event
                .on("drag", duringDrag)
                .on("end", endDrag);
        }
    
        startDrag(event, d)
    }

    function drawCircles(nodes: ITreeNode[]) {
        const circles = d3
            .select('.circle')
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr("r", 6)
            .attr("token-id", d => d.arethusaTokenId)
            .attr("treenode-id", d => d.treeNodeId)
    
        d3.select(".circle")
            .selectAll("circle")
            .call(d3.drag().on("start", handleDrag))

        return circles
    }

    export function drawEdgeLabels(links: ITreeLink[]) {

        d3.select(".edgelabel")
            .selectAll('*')
            .remove()

        const edgeLabels = d3
            .select('.edgelabel')
            .selectAll("foreignObject")
            .data(links)
            .enter().append("foreignObject")
            .attr("class", "edge-label")
            .attr("id", (d) => `edl-${d.id}`)
            .attr("dep-id", (d) => d.depTreeNodeId)
            .attr("head-id", (d) => d.headTreeNodeId)
            .attr("width", "1") // cf. https://stackoverflow.com/questions/16254651/auto-height-for-a-foreignobject-in-svg
            .attr("height", "1")
            .attr("overflow", "visible")

        d3.selectAll(".edgelabel")
            .selectAll(".edge-label-div")
            .remove()

        const divs = d3
            .selectAll(".edge-label")
            .data(links)
            .append("xhtml:div")
            .attr("class", "edge-label-div")
            .attr("contenteditable", "false")
            .attr("id", (d) => `edl-${d.id}`)
            .attr("slash-id", (d) => `${d.id}`)
            .attr("dep-id", (d) => d.depTreeNodeId)
            .attr("head-id", (d) => d.headTreeNodeId)
            .attr("type", (d) => d.type)
            .html( (d) => d.relation === "" ? Constants.defaultRel : d.relation )

        const edgeDivLabels = Graph.edgeDivLabels()

        edgeDivLabels.forEach((elem) => {
            elem.addEventListener("keydown", UserInput.keyDownEdgeLabel)
            elem.addEventListener("click", UserInput.leftClickEdgeLabel)
        })
            
        return edgeLabels
    }
    
    const drawNodeLabels = (nodes: ITreeNode[]) => {
        d3.select(".text")
            .selectAll('*')
            .remove()   

        const nodeLabels = d3
            .select('.text')
            .selectAll("text")  // Don't know why this is necessary
            .data(nodes)
            .enter().append("text")
            .attr("class", "node-label")
            .attr("treenode-id", (d) => d.treeNodeId )
            .attr("token-id", (d) => d.arethusaTokenId )
            .attr("x", "0.5em")
            .attr("y", "1em")
            .attr("width", "1") // cf. https://stackoverflow.com/questions/16254651/auto-height-for-a-foreignobject-in-svg
            .attr("height", "1")
            .attr("overflow", "visible")

        d3.selectAll(".node-label") // Needs to be separate for some reason to update on change
            .data(nodes)
            .html( (d) => d.name )
    
        d3.select(".text")
            .selectAll("text.node-label")
            .call(d3.drag().on("start", handleDrag))
    
        const nodeLabelElems = document
            .querySelectorAll("text.node-label")

        nodeLabelElems.forEach((elem) => {
            elem.addEventListener("contextmenu", UserInput.rightClickNodeLabel)
            elem.addEventListener("click", UserInput.leftClickNodeLabel)
        })

        return nodeLabels
    }

    function drawPathMarkers() {
        container
            .append("defs")
            .selectAll("marker")
            .data(["head", "slash"])
            .enter()
            .append("marker")
            .attr("id", (d: ITreeLink) => d)
            .attr("viewBox", "0 0 10 10")
            .attr("orient", "auto")
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("refX", 10)
            .attr("refY", 3)
            .append("path")
            .attr("d", "M0,0L6,3L0,6");
    }

    function drawPaths(links: ITreeLink[]) {
        const paths = d3
            .select('.links')
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("d", linkArc(links))
            .attr("class", (d) => "link " + d.type )
            .attr("id", (d) => `edg-${d.id}` )
            .attr("marker-end", (d) => "url(#" + d.type + ")" )
        
        return paths
    }

    export function edgeLabelById (id: Maybe<string>) {
        const generateSelector = (s: string) => 
            "div.edge-label-div[id='" + s + "']"
        
        return id
            .fmap(generateSelector)
            .bind(HTML.q) as Maybe<HTMLDivElement>
    }

    export function edgePathById (id: Maybe<string>) {
        const generateSelector = (s: string) => 
            "path.link[id='" + s + "']"
        
        return id
            .fmap(generateSelector)
            .bind(HTML.q) as Maybe<HTMLDivElement>
    }

    export const edgeDivLabels = () => {
        const edgeDivLabels = document.querySelectorAll("div.edge-label-div")
        const edgeDivLabelArr = new Array<HTMLDivElement>()
        edgeDivLabels.forEach ( (item: HTMLDivElement) => {
            edgeDivLabelArr.push(item)
        })
        return edgeDivLabelArr
    }

    const edgeLabelPos = (paths) => (d: ITreeLink) => {
          
        let localPath = paths._groups[0].find(x => x.id === `edg-${d.id}`);
        let pathLength = localPath.getTotalLength();
        
        const x = localPath.getPointAtLength(pathLength / 2).x;
        const y = localPath.getPointAtLength(pathLength / 2).y;

        return "translate(" + x + "," + y + ")";
    }    
    
    export function graph(state: TreeStateIO) {

        window.onclick = ( 
            (e: MouseEvent) => {

                // Clear tree click state
                globalState
                    .treeStateIO
                    .fmap(
                        TreeStateIO.changeClickState(
                            ClickState.of
                                (Nothing.of()) 
                                (TreeLabelType.Unknown)
                                (ClickType.Unknown)
                        )
                    )
                unclickAll()

                // Clear output Arethusa click state
                const currentSentenceId = globalState
                    .textStateIO
                    .bind(TextStateIO.currentSentence)
                    .bind(ArethusaSentence.id)
                globalState
                    .textStateIO
                    .fmap(TextStateIO.changeView
                        (Nothing.of()) 
                        (currentSentenceId)
                )
            
            }
        )

        window.onkeydown = ( (e: KeyboardEvent) => {
            UserInput.keyDownEdgeLabel(e)
        })    
        
        clearGraph()
    
        let svg = d3.select("svg")
            .append("g")
            .attr("class", "container")
            .attr("xmlns:xhtml", "http://www.w3.org/1999/xhtml")

        container = d3.select("g.container");
    
        container.append("g")
            .attr("class", "links");
        container.append("g")
            .attr("class", "circle");
        container.append("g")
            .attr("class", "text");
        container.append("g")
            .attr("class", "edgelabel");
    
        drawPathMarkers();
        resetClock();
        createSimulation(state);
    }

    export function nodeLabelById (id: Maybe<string>) {
        const generateSelector = (s: string) => 
            "text.node-label[treenode-id='" + s + "']"
        
        return id
            .fmap(generateSelector)
            .bind(HTML.q) as Maybe<SVGTextElement>
    }

    export function nodeLabels () {
        const textNodes = document.querySelectorAll("text.node-label") 
        const textNodeArr = new Array<SVGTextElement>()
        
        textNodes.forEach( (item: SVGTextElement) => {
            textNodeArr.push(item)
        })

        return textNodeArr
    }

    export function unclickAll () {
        Graph.unclickEdgeLabels()
        Graph.unclickNodeLabels()
        Graph.unclickCircles()
    }

    export const unclickNodeLabels = () => {
        const nodeLabels = Graph.nodeLabels()
        nodeLabels.forEach ((item: SVGTextElement) => {
            item.classList.remove("clicked")
        })        
    }

    export const unclickEdgeLabels = () => {
        const edgeLabels = Graph.edgeDivLabels()
        edgeLabels.forEach ((item: HTMLDivElement ) => {
            item.classList.remove("clicked")
            item.setAttribute("contenteditable", "false")
        })
    }  

    export const unclickCircles = () => {
        const circles = Graph.circles()
        circles.forEach ((item: SVGCircleElement ) => {
            item.classList.remove("clicked")
        })
    }

    function setForces(
        nodes: ITreeNode[], 
        links: ITreeLink[]) {
    
        globalState.simulation
            .force('charge', d3.forceManyBody().strength(manyBodyStrength))
            .force('center', d3.forceCenter(300, 300))
    
        .force('link', d3.forceLink()
            .links(links)
            .distance(linkDistance)
            .strength(linkStrength)
        )
        .force('x', d3.forceX().x(
            (d: ITreeNode) => {
                // switch (treebank.direction) {
                //     case (TextDir.LTR): {
                //         return d.treeNodeId * xMult;
                //     }
                //     case (TextDir.RTL): {
                //         return (nodes.length - d.treeNodeId) * xMult;
                //     }
                //     default: {
                        return d.treeNodeId * xMult;
                //     }
                // }
            }
        )
            .strength(xStrength)    
        )
        .force('y', d3.forceY().y(function (d: ITreeNode) {
            return d.distToRoot * yMult;
        })
            .strength(yStrength)
        )
        .force('collision', d3.forceCollide().radius(
            (d: ITreeNode) => {
                return d.radius === undefined ? 10 : d.radius;
            })
            .strength(collisionStrength)
        )
    }
    
    function tick(paths, links, circles, nodeLabels, edgeLabels) {
    
        function _tick() {

            switch (Date.now() < end) {
                case true:
                    paths.attr("d", linkArc(links));
                    circles.attr("transform", transform);
                    nodeLabels.attr("transform", transform_);
                    edgeLabels.attr("transform", edgeLabelPos(paths));
                    break
                case false:
                    globalState.simulation.stop();

                    // Used to stop the graph starting from the beginning on undo / redo
                    globalState
                        .treeStateIO
                        .fmap(
                            TreeStateIO.replaceSentStateFromNodes(
                                globalState.simulation.nodes(),
                                false, 
                                globalState
                                    .treeStateIO
                                    .fmap(TreeStateIO.currentSentStateIdx)
                                    .unpackT(0)
                            )
                        )
    
                    globalState
                        .textStateIO
                        .bind(TextStateIO.currentState)
                        .fmap(TextState.updateTreeState(globalState.treeStateIO.fmap(TreeStateIO.currentSentState)))
                    break
    
            }
        }
        return _tick
    }
    
    // cf. https://observablehq.com/@d3/mobile-patent-suits
    const linkArc = (links: ITreeLink[]) => (d: ITreeLink) => {
        
        let parallels = TreeNode
            .parallelLinks(links, d.source.treeNodeId, d.target.treeNodeId)

        return parallels.length === 1 ?
            linkPath(d, ArcType.Straight) : 
            linkPath(d)
    }
    
    function linkPath(d: ITreeLink, type?: ArcType): string {
        if (d.target.x === undefined || d.source.x === undefined) {
            return "M0,0L0,0"
        }

        if (d.target.y === undefined || d.source.y === undefined) {
            return "M0,0L0,0"
        }
    
        const dx = d.target.x - d.source.x
        const dy = d.target.y - d.source.y
        const ra = Math.sqrt(dx * dx + dy * dy) * 0.6;
    
        const rb = ra;
    
        if (type == ArcType.Straight) {
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        }
    
        switch (d.type) {
            case LinkType.Slash: {
                return "M" + d.source.x + "," + d.source.y + "A" + ra + "," + rb + " 0 0,1 " + d.target.x + "," + d.target.y;
            }
    
            case LinkType.Head: {
                return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
            }
    
            default: {
                return ""
            }
        }
    }

    function transform(d: ITreeNode) {
        const x =  "translate(" + d.x + "," + d.y + ")";
        return x
    }

    function transform_(d: ITreeNode) {
        const x =  "translate(" + d.x + "," + d.y + ")";
        return x
    }
    
    export function updateSimulation(state: TreeStateIO) {
        if (globalState.simulation === undefined) {
            createSimulation(state)
            return
        }

        const nodes = state.currentTreeState.nodes
        const links = TreeNode.links(nodes)

        globalState.simulation.nodes(nodes)
        setForces(nodes, links)

        const paths = drawPaths(links);
        const circles = drawCircles(nodes);
        const nodeLabels = drawNodeLabels(nodes);
        const edgeLabels = drawEdgeLabels(links);

        globalState
            .simulation
            .on('tick', tick(paths, links, circles, nodeLabels, edgeLabels));

        resetClock()
        globalState
            .simulation
            .alphaTarget(alphaTarget)
            .restart();
    }
    
    export function updateSimulation_(ts: TreeState) {
        if (globalState.simulation === undefined) {
            createSimulation_(ts)
            return
        }

        if (globalState.textStateIO.fmap(TextStateIO.currentSentence).isNothing) {
            Graph.clearGraph()
            return
        }

        const nodes = ts.nodes
        const links = TreeNode.links(nodes)

        globalState.simulation.nodes(nodes)
        setForces(nodes, links)

        const paths = drawPaths(links);
        const circles = drawCircles(nodes);
        const nodeLabels = drawNodeLabels(nodes);
        const edgeLabels = drawEdgeLabels(links);

        unclickCircles()
        ts.clickState
            .circleElem
            .fmap(HTML.Elem.Class.add("clicked"))
        ts.clickState
            .labelElem
            .fmap(HTML.Elem.Class.add("clicked"))

        globalState
            .simulation
            .on(
                'tick', 
                tick(
                    paths, 
                    links, 
                    circles, 
                    nodeLabels, 
                    edgeLabels
                )
            );

        resetClock()
        globalState.simulation
            .alphaTarget(alphaTarget)
            .restart();
    }

    export function createSimulation(state: TreeStateIO) {
        const tokens = state.currentTreeState.tokens
        const nodes = TreeNode.tokensToTreeNodes(tokens)
        const links = TreeNode.links(nodes)
    
        const paths = drawPaths(links);
        const circles = drawCircles(nodes);
        const nodeLabels = drawNodeLabels(nodes);
        const edgeLabels = drawEdgeLabels(links);

        globalState.simulation = d3.forceSimulation(nodes);
        setForces(nodes, links)

        resetClock()
        globalState
            .simulation
            .on(
                'tick', 
                tick(paths, links, circles, nodeLabels, edgeLabels)
            );
    }

    export function createSimulation_(state: TreeState) {
        const tokens = state.tokens
        const nodes = TreeNode.tokensToTreeNodes(tokens)
        const links = TreeNode.links(nodes)
    
        const paths = drawPaths(links);
        const circles = drawCircles(nodes);
        const nodeLabels = drawNodeLabels(nodes);
        const edgeLabels = drawEdgeLabels(links);

        globalState.simulation = d3.forceSimulation(nodes);
        setForces(nodes, links)

        resetClock()
        globalState
            .simulation
            .on(
                'tick', 
                tick(paths, links, circles, nodeLabels, edgeLabels)
            );
    }

    export const svg = () => {
        return MaybeT.of(
            document.querySelector("div.tree-container svg") as SVGElement
        )
    }

    export const viewbox = () => {
        return svg()
            .bind(SVG.ViewBox.getViewBoxStr)
    }
}

