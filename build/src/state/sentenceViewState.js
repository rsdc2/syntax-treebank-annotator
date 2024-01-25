class SentenceViewBox {
    _sentenceId;
    _viewbox;
    static viewbox = (svb) => {
        return svb.viewbox;
    };
    get sentenceId() {
        return this._sentenceId;
    }
    static setViewBox = (viewbox) => (svb) => {
        svb._viewbox = viewbox;
        return svb;
    };
    get viewbox() {
        return this._viewbox;
    }
}
/**
 * Primarily to store information about the viewbox for each sentence
 *
 */
class SentenceViewState {
    _viewstates;
    constructor(sentenceIds) {
        this._viewstates = sentenceIds.map((id) => {
            return {
                _sentenceId: id,
                _viewbox: Constants.defaultViewBox
            };
        });
    }
    static deepcopy = (svs) => {
        const newSVS = new SentenceViewState([]);
        newSVS._viewstates = [...svs._viewstates];
        return newSVS;
    };
    hasSentenceId(id) {
        return id in this.sentenceIds;
    }
    static setViewBoxBySentenceId = (id) => (viewbox) => (svs) => {
        return SentenceViewState
            .sentenceViewboxBySentenceId(id)(svs)
            .fmap(SentenceViewBox.setViewBox(viewbox));
    };
    setViewBoxBySentenceId = (id) => (viewbox) => {
        return SentenceViewState
            .setViewBoxBySentenceId(id)(viewbox)(this);
    };
    static sentenceViewboxBySentenceId = (id) => (svs) => {
        const viewstates = svs
            .viewstates
            .filter((item) => item._sentenceId == id);
        return Arr.head(viewstates);
    };
    static sentenceIds = (svs) => {
        return svs._viewstates
            .map((item) => item._sentenceId);
    };
    get sentenceIds() {
        return SentenceViewState.sentenceIds(this);
    }
    static getvb = (s, id) => {
        const r = s.filter((item) => item._sentenceId == id);
        if (r.length > 0) {
            return r[0]._viewbox;
        }
        else {
            return Constants.defaultViewBox;
        }
    };
    static updateFromTSIO = (tsio) => (svs) => {
        const tsioIds = tsio.outputArethusaSentenceIds;
        const svsIds = svs.sentenceIds;
        const result = tsioIds.map((id) => {
            if (svsIds.includes(id)) {
                return {
                    _sentenceId: id,
                    _viewbox: SentenceViewState.getvb(svs._viewstates, id)
                };
            }
            return {
                _sentenceId: id,
                _viewbox: Constants.defaultViewBox
            };
        });
        svs._viewstates = result;
        return svs;
    };
    updateFromTSIO = (tsio) => {
        SentenceViewState
            .updateFromTSIO(tsio)(this);
    };
    static updateSVGViewBox = (sentId) => (svs) => {
        const vb = SentenceViewState
            .getvb(svs._viewstates, sentId);
        const setViewBox = SVG.ViewBox.setViewBoxVal(vb);
        Graph.svg()
            .fmap(setViewBox);
    };
    get viewstates() {
        return this._viewstates;
    }
    static viewstates = (vs) => {
        return vs.viewstates;
    };
}
