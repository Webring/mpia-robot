class Point {
    constructor(x, y) {
        this.x = +x
        this.y = +y
        this.coordinates = [+x, +y]
    }

    equals(other) {
        return (this.x == other.x) && (this.y == other.y)
    }

    toString() {
        return `(${this.x}, ${this.y})`
    }
}

class Triangle {
    constructor(point_1, point_2, point_3) {
        this.point_1 = point_1
        this.point_2 = point_2
        this.point_3 = point_3
    }

    values() {
        return [this.point_1.x, this.point_1.y, this.point_2.x, this.point_2.y, this.point_3.x, this.point_3.y]
    }
}

