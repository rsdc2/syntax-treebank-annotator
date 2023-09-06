var SVG;
(function (SVG) {
    let Circle;
    (function (Circle) {
        Circle.circleByTokenId = (id) => {
            return HTML.q(`circle[token-id="${id}"]`);
        };
        Circle.circleByTreeNodeId = (id) => {
            return HTML.q(`circle[treenode-id="${id}"]`);
        };
    })(Circle = SVG.Circle || (SVG.Circle = {}));
    let Matrix;
    (function (Matrix) {
        Matrix.d = (matrix) => {
            return matrix.d;
        };
        Matrix.e = (matrix) => {
            return matrix.e;
        };
        Matrix.f = (matrix) => {
            return matrix.f;
        };
    })(Matrix = SVG.Matrix || (SVG.Matrix = {}));
    let Point;
    (function (Point) {
        const createPoint = (x, y) => {
            return new DOMPoint(x, y);
        };
        Point.x = (point) => {
            return point.x;
        };
        Point.y = (point) => {
            return point.y;
        };
    })(Point = SVG.Point || (SVG.Point = {}));
    let ViewBox;
    (function (ViewBox) {
        ViewBox.getViewBoxVal = (index) => (viewBoxStr) => {
            return MaybeT.of(viewBoxStr)
                .fmap(Str.split(" "))
                .bind(Arr.byIdx(index));
        };
        ViewBox.getViewBoxValFromSVGElem = (index) => (svgElem) => {
            return MaybeT.of(svgElem)
                .bind(ViewBox.getViewBoxStr)
                .fmap(Str.split(" "))
                .bind(Arr.byIdx(index))
                .fmap(Str.toNum);
        };
        ViewBox.getViewBoxStr = (svg) => {
            return HTML.Elem.getAttr("viewBox")(svg);
        };
        ViewBox.setViewBoxVal = (val) => (svg) => {
            MaybeT.of(svg)
                .fmap(HTML.Elem.setAttr("viewBox")(val));
        };
        const calcNewViewBoxStr = (val) => (index) => (s) => {
            const f = flip_1_to_3(Arr.replaceByIdx);
            return MaybeT.of(s)
                .fmap(Str.split(" "))
                .fmap(f(val)(index))
                .fromMaybe([])
                .join(" ");
        };
        const changeViewBoxVal = (func) => (limit) => (index) => (svg) => {
            const _setViewBoxVal = MaybeT.of(svg)
                .bind(ViewBox.getViewBoxStr)
                .bind(func(limit)(index))
                .fmap(ViewBox.setViewBoxVal);
            MaybeT.of(svg)
                .applyFmap(_setViewBoxVal);
        };
        ViewBox.decrMinX = (svg) => {
            changeViewBoxVal(decrViewBoxVal)(null)(0)(svg);
        };
        ViewBox.incrMinX = (svg) => {
            changeViewBoxVal(incrViewBoxVal)(null)(0)(svg);
        };
        ViewBox.decrMinY = (svg) => {
            changeViewBoxVal(decrViewBoxVal)(null)(1)(svg);
        };
        ViewBox.incrMinY = (svg) => {
            changeViewBoxVal(incrViewBoxVal)(null)(1)(svg);
        };
        ViewBox.zoomIn = (svg) => {
            changeViewBoxVal(decrViewBoxVal)(0)(3)(svg);
            changeViewBoxVal(decrViewBoxVal)(0)(2)(svg);
        };
        ViewBox.zoomOut = (svg) => {
            changeViewBoxVal(incrViewBoxVal)(null)(3)(svg);
            changeViewBoxVal(incrViewBoxVal)(null)(2)(svg);
        };
        const decrViewBoxVal = (limit) => (index) => (viewBoxStr) => {
            if (limit !== null) {
                if (ViewBox.getViewBoxVal(index)(viewBoxStr).fmap(Str.toNum).fromMaybe(0) - 50 < limit) {
                    return;
                }
            }
            const f = flip_1_to_3(calcNewViewBoxStr);
            return ViewBox.getViewBoxVal(index)(viewBoxStr)
                .fmap(Str.minus(50))
                .fmap(f(index)(viewBoxStr));
        };
        const incrViewBoxVal = (limit) => (index) => (viewBoxStr) => {
            const f = flip_1_to_3(calcNewViewBoxStr);
            return ViewBox.getViewBoxVal(index)(viewBoxStr)
                .fmap(Str.add(50))
                .fmap(f(index)(viewBoxStr));
        };
    })(ViewBox = SVG.ViewBox || (SVG.ViewBox = {}));
})(SVG || (SVG = {}));
