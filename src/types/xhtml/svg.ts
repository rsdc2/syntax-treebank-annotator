namespace SVG {

    export namespace Circle {

        export const circleByTokenId = (id: string) => {
            return HTML.q(`circle[token-id="${id}"]`) as Maybe<SVGCircleElement>
        }

        export const circleByTreeNodeId = (id: string) => {
            return HTML.q(`circle[treenode-id="${id}"]`) as Maybe<SVGCircleElement>
        }
    }

    export namespace Matrix {
        export const d = (matrix: DOMMatrix) => {
            return matrix.d
        }
        export const e = (matrix: DOMMatrix) => {
            return matrix.e
        }
        export const f = (matrix: DOMMatrix) => {
            return matrix.f
        }
    }

    export namespace Point {
        const createPoint = (x: number, y: number) => {
            return new DOMPoint(x, y)
        }

        export const x = (point: DOMPoint) => {
            return point.x
        }

        export const y = (point: DOMPoint) => {
            return point.y
        }
    }

    export namespace ViewBox {

        export const getViewBoxVal = (index: number) => (viewBoxStr: string) => {
            return MaybeT.of(viewBoxStr)
                .fmap(Str.split(" "))
                .bind(Arr.byIdx(index))
        }

        export const getViewBoxValFromSVGElem = 
            (index: number) => 
            (svgElem: SVGElement | SVGGraphicsElement) => 
        {
            return MaybeT.of(svgElem)
                .bind(getViewBoxStr)
                .fmap(Str.split(" "))
                .bind(Arr.byIdx(index))
                .fmap(Str.toNum)
        }

        export const getViewBoxStr = (svg: SVGElement) => {
            return HTML.Elem.getAttr("viewBox")(svg)
        }
        
        export const setViewBoxVal = (val: string) => (svg: SVGElement) => {
            MaybeT.of(svg)
                .fmap(HTML.Elem.setAttr("viewBox")(val))
        }

        const calcNewViewBoxStr = 
            (val: string) => 
            (index: number) => 
            (s: string) => 
        {
            const f = flip_1_to_3(Arr.replaceByIdx)
            return MaybeT.of(s)
                .fmap(Str.split(" "))
                .fmap(f(val)(index))
                .fromMaybe([])
                .join(" ")
        }

        const changeViewBoxVal = (func) => (limit: number | null) => (index:number) => (svg: SVGElement) => {
            const _setViewBoxVal = MaybeT.of(svg)
                .bind(getViewBoxStr)
                .bind(func(limit)(index))
                .fmap(setViewBoxVal)
                
            MaybeT.of(svg)
                .applyFmap(_setViewBoxVal)            
        }

        export const decrMinX = (svg: SVGElement) => {
            changeViewBoxVal(decrViewBoxVal)(null)(0)(svg)
        }        

        export const incrMinX = (svg: SVGElement) => {
            changeViewBoxVal(incrViewBoxVal)(null)(0)(svg)
        }

        export const decrMinY = (svg: SVGElement) => {
            changeViewBoxVal(decrViewBoxVal)(null)(1)(svg)
        }        

        export const incrMinY = (svg: SVGElement) => {
            changeViewBoxVal(incrViewBoxVal)(null)(1)(svg)
        }

        export const zoomIn = (svg: SVGElement) => {
            changeViewBoxVal(decrViewBoxVal)(0)(3)(svg)
            changeViewBoxVal(decrViewBoxVal)(0)(2)(svg)
        }

        export const zoomOut = (svg: SVGElement) => {
            changeViewBoxVal(incrViewBoxVal)(null)(3)(svg)
            changeViewBoxVal(incrViewBoxVal)(null)(2)(svg)
        }

        const decrViewBoxVal = (limit: number | null) => (index: number) => (viewBoxStr: string) => {
            if (limit !== null) {
                if (getViewBoxVal(index)(viewBoxStr).fmap(Str.toNum).fromMaybe(0) - 50 < limit) {
                    return
                }
            }

            const f = flip_1_to_3(calcNewViewBoxStr)
            return getViewBoxVal(index)(viewBoxStr)
                .fmap(Str.minus(50))
                .fmap(f(index)(viewBoxStr))
        }

        const incrViewBoxVal = 
            (limit: number | null) => 
            (index: number) => 
            (viewBoxStr: string) => 
        {
            const f = flip_1_to_3(calcNewViewBoxStr)
            return getViewBoxVal(index)(viewBoxStr)
                .fmap(Str.add(50))
                .fmap(f(index)(viewBoxStr))
        }
    
    }


}