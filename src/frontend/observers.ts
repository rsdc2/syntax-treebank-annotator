
namespace Observers {

    // const setSVGObserver = () => {
    //     const svg = Graph.svg().value

    //     if (svg !== null) {
    //         const observer = new ResizeObserver( (entries) => {
    //             const h = svg.clientHeight
    //             const w = svg.clientWidth

    //             const d = h > w ? w : h
    //             svg.setAttribute("width", Str.fromNum(d))
    //             svg.setAttribute("height", Str.fromNum(d))
                
    //         })
    //     }
    // }

    const setTopToolbarObserver = () => {
        const tb = Frontend.topToolbarDiv.value

        if (tb !== null) {
            const observer = new ResizeObserver( (entries) => {
                const newMarginTop = Str
                    .fromNum(tb.offsetHeight + 10)
                    .concat("px")
    
                const boundaryDiv = Frontend
                    .leftBoundaryDiv
                    .value
    
                if (boundaryDiv != null) {
                    boundaryDiv
                        .style
                        .marginTop = newMarginTop 
                }        
            })
    
            observer.observe(tb)
        }
    
    }


    export const setResizeObservers = () => {
        setTopToolbarObserver()
    }
}