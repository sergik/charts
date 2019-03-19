import * as model from '../chart.app.d'
export class LinearScale {
    constructor(private domain: model.IRangeUnit, private range: model.IRangeUnit){
    }
    scale(value){
        const position = value - this.domain.from
        const domainRange = Math.abs(this.domain.to - this.domain.from)
        const relPosiotion = position/domainRange
        const dataRange = this.range.to - this.range.from
        var positionDelta = dataRange * relPosiotion
        return this.range.from + positionDelta
    }
}