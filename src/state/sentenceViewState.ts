
interface ISentenceViewBox {
    _sentenceId: string,
    _viewbox: string
}

class SentenceViewBox implements ISentenceViewBox {
    _sentenceId: string
    _viewbox: string
    
    static viewbox = (svb: SentenceViewBox) => {
        return svb.viewbox
    }

    get sentenceId() {
        return this._sentenceId
    }

    static setViewBox = (viewbox: string) => (svb: SentenceViewBox) => {
        svb._viewbox = viewbox
        return svb
    }

    get viewbox() {
        return this._viewbox
    }
}

/**
 * Primarily to store information about the viewbox for each sentence
 * 
 */

class SentenceViewState {
    _viewstates: ISentenceViewBox[]

    constructor(sentenceIds: string[]) {
        this._viewstates = sentenceIds.map( 
            (id:string): ISentenceViewBox => {
                return {
                    _sentenceId: id,
                    _viewbox: Constants.defaultViewBox
                }
            }
        )
    }

    hasSentenceId(id: string) {
        return id in this.sentenceIds
    }

    static setViewBoxBySentenceId = 
        (id: string) => 
        (viewbox: string) => 
        (svs: SentenceViewState) =>
    {
        return SentenceViewState
            .sentenceViewboxBySentenceId(id)(svs)
            .fmap(SentenceViewBox.setViewBox(viewbox))
    }

    setViewBoxBySentenceId = 
        (id: string) => 
        (viewbox: string) => 
    {
        return SentenceViewState
            .setViewBoxBySentenceId(id)(viewbox)(this)
    }

    static sentenceViewboxBySentenceId = 
        (id: string) => 
        (svs: SentenceViewState) => 
    {
        const viewstates = svs
            .viewstates
            .filter( (item) => item._sentenceId == id )
        return Arr.head(viewstates)
    }

    static sentenceIds = 
        (svs: SentenceViewState) => 
    {
        return svs._viewstates
            .map((item) => item._sentenceId)
    }

    get sentenceIds () {
        return SentenceViewState.sentenceIds(this)
    }

    static getvb = (s: ISentenceViewBox[], id:string) => {
        const r = s.filter( (item) => item._sentenceId == id)
        if (r.length > 0) {
            return r[0]._viewbox
        }
        else {
            return Constants.defaultViewBox
        }
    }

    static updateFromTSIO = 
        (tsio: TextStateIO) => 
        (svs: SentenceViewState) => 
    {
        const tsioIds = tsio.outputArethusaSentenceIds
        const svsIds = svs.sentenceIds

        const result = tsioIds.map( 
            (id:string): ISentenceViewBox => {
                console.log(id, svsIds)

                if (svsIds.includes(id)) {
                    return {
                        _sentenceId: id,
                        _viewbox: SentenceViewState.getvb(svs._viewstates, id)
                    }
                }

                return {
                    _sentenceId: id,
                    _viewbox: Constants.defaultViewBox
                }
            }
        )

        svs._viewstates = result
    }

    updateFromTSIO = (tsio:TextStateIO) => {
        SentenceViewState
            .updateFromTSIO
                (tsio)
                (this)
    }

    static updateSVGViewBox = 
        (sentId: string) => 
        (svs: SentenceViewState) =>
    {
        const vb = SentenceViewState
            .getvb(svs._viewstates, sentId)
    
        const setViewBox = SVG.ViewBox.setViewBoxVal(vb)
        Graph.svg()
            .fmap(setViewBox)
    }

    get viewstates() {
        return this._viewstates
    }

    static viewstates = (vs: SentenceViewState) => {
        return vs.viewstates
    }
}