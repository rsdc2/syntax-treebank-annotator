var Observers;
(function (Observers) {
    const setTopToolbarObserver = () => {
        const tb = Frontend.topToolbarDiv.value;
        if (tb !== null) {
            const observer = new ResizeObserver((entries) => {
                const newMarginTop = Str
                    .fromNum(tb.offsetHeight + 10)
                    .concat("px");
                const boundaryDiv = Frontend
                    .leftBoundaryDiv
                    .value;
                if (boundaryDiv != null) {
                    boundaryDiv
                        .style
                        .marginTop = newMarginTop;
                }
            });
            observer.observe(tb);
        }
    };
    Observers.setResizeObservers = () => {
        setTopToolbarObserver();
    };
})(Observers || (Observers = {}));
