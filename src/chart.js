export class Chart {
    constructor(data, container) {
        this.data = data;
        this.container = container;
    }

    draw() {
        this.container.innerHTML = 'some chart !'
    }
}