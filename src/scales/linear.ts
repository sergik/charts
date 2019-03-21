import * as model from '../chart.app.d'
export class LinearScale {
    private domainRange
    private dataRange
    constructor(private domain: model.IRangeUnit, private range: model.IRangeUnit){
        this.domainRange = Math.abs(this.domain.to - this.domain.from)
        this.dataRange = this.range.to - this.range.from
    }
    scale(value){
        const position = value - this.domain.from
        const relPosiotion = position/this.domainRange
        var positionDelta = this.dataRange * relPosiotion
        return this.range.from + positionDelta
    }
}