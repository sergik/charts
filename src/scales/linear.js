export class LinearScale {
    constructor(domain, range){
        this.domain = domain;
        this.range = range;
    }

    scale(value){
        const position = value - this.domain[0]
        const domainRange = Math.abs(this.domain[1] - this.domain[0])
        const relPosiotion = position/domainRange
        const dataRange = this.range[1] - this.range[0]
        var positionDelta = dataRange * relPosiotion
        return this.range[0] + positionDelta
    }
}