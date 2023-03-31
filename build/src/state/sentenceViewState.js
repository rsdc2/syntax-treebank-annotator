class SentenceViewBox {
    get sentenceId() {
        return this._sentenceId;
    }
    get viewbox() {
        return this._viewbox;
    }
}
SentenceViewBox.viewbox = (svb) => {
    return svb.viewbox;
};
SentenceViewBox.setViewBox = (viewbox) => (svb) => {
    svb._viewbox = viewbox;
    return svb;
};
/**
 * Primarily to store information about the viewbox for each sentence
 *
 */
class SentenceViewState {
    constructor(sentenceIds) {
        this.setViewBoxBySentenceId = (id) => (viewbox) => {
            return SentenceViewState
                .setViewBoxBySentenceId(id)(viewbox)(this);
        };
        this.updateFromTSIO = (tsio) => {
            SentenceViewState
                .updateFromTSIO(tsio)(this);
        };
        this._viewstates = sentenceIds.map((id) => {
            return {
                _sentenceId: id,
                _viewbox: Constants.defaultViewBox
            };
        });
    }
    hasSentenceId(id) {
        return id in this.sentenceIds;
    }
    get sentenceIds() {
        return SentenceViewState.sentenceIds(this);
    }
    get viewstates() {
        return this._viewstates;
    }
}
SentenceViewState.deepcopy = (svs) => {
    const newSVS = new SentenceViewState([]);
    newSVS._viewstates = [...svs._viewstates];
    return newSVS;
    // console.log(newSVS._viewstates)
    // console.log(newSVS)
    // return JSON.parse(JSON.stringify(svs)) as SentenceViewState
};
SentenceViewState.setViewBoxBySentenceId = (id) => (viewbox) => (svs) => {
    return SentenceViewState
        .sentenceViewboxBySentenceId(id)(svs)
        .fmap(SentenceViewBox.setViewBox(viewbox));
};
SentenceViewState.sentenceViewboxBySentenceId = (id) => (svs) => {
    const viewstates = svs
        .viewstates
        .filter((item) => item._sentenceId == id);
    return Arr.head(viewstates);
};
SentenceViewState.sentenceIds = (svs) => {
    return svs._viewstates
        .map((item) => item._sentenceId);
};
SentenceViewState.getvb = (s, id) => {
    const r = s.filter((item) => item._sentenceId == id);
    if (r.length > 0) {
        return r[0]._viewbox;
    }
    else {
        return Constants.defaultViewBox;
    }
};
SentenceViewState.updateFromTSIO = (tsio) => (svs) => {
    const tsioIds = tsio.outputArethusaSentenceIds;
    const svsIds = svs.sentenceIds;
    const result = tsioIds.map((id) => {
        console.log(id, svsIds);
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
SentenceViewState.updateSVGViewBox = (sentId) => (svs) => {
    const vb = SentenceViewState
        .getvb(svs._viewstates, sentId);
    const setViewBox = SVG.ViewBox.setViewBoxVal(vb);
    Graph.svg()
        .fmap(setViewBox);
};
SentenceViewState.viewstates = (vs) => {
    return vs.viewstates;
};
