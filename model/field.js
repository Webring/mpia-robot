class Field {
    constructor(height, width) {
        this.change_size(height, width)

        this.clear()
    }

    change_size(height, width) {
        this.height = height
        this.width = width
        this.decomposed_field = null
    }

    clear(){
        this.robot = null
        this.places = []
        this.barriers = []

        this.decomposed_field = null
    }

    is_decomposed() {
        return this.decomposed_field != null
    }

    place_robot(x, y) {
        let point = new Point(x, y)
        if (this.point_is_free(point)) {
            this.robot = new Point(x, y)
            return true
        }
        return false
    }

    add_barrier(point_1, point_2, point_3) {
        let barrier = new Triangle(point_1, point_2, point_3)
        this.barriers.push(barrier)
        this.decomposed_field = null
    }

    add_place(x, y) {
        let new_place = new Point(x, y)
        if (this.point_is_free(new_place)) {
            this.places.push(new_place)
            return true
        }
        return false
    }

    is_valid_point(point) {
        return (point.x >= 0) && (point.x < this.width) && (point.y >= 0) && (point.y < this.height)
    }

    point_is_free(point) {
        if (!this.is_valid_point(point)) {
            return false
        }

        for (let item of this.barriers) {
            if (this.is_point_in_triangle(point, item) || this.is_point_on_triangle(point, item)) {
                return false
            }
        }
        return true
    }

    is_point_in_triangle(point, triangle) {
        const [x, y] = point.coordinates;
        const [x1, y1] = triangle.point_1.coordinates;
        const [x2, y2] = triangle.point_2.coordinates;
        const [x3, y3] = triangle.point_3.coordinates;

        // Вычисляем барицентрические координаты точки
        const alpha = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) /
            ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
        const beta = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) /
            ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
        const gamma = 1 - alpha - beta;

        return ((alpha > 0) && (beta > 0) && (gamma > 0));
    }

    is_point_on_triangle(point, triangle) {
        let point_on_line_1 = this.is_point_on_line(point, triangle.point_1, triangle.point_2)
        let point_on_line_2 = this.is_point_on_line(point, triangle.point_2, triangle.point_3)
        let point_on_line_3 = this.is_point_on_line(point, triangle.point_3, triangle.point_1)
        return point_on_line_1 || point_on_line_2 || point_on_line_3
    }

    is_point_on_line(point, line_point_1, line_point_2) {
        const [x, y] = point.coordinates;
        const [x1, y1] = line_point_1.coordinates;
        const [x2, y2] = line_point_2.coordinates;

        let alpha = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        let beta = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
        let gamma = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));
        //(x - x1) * (y2 - y1) == (x2 - x1) * (y - y1)
        return alpha == beta + gamma
    }


    decompose(cell_width, cell_height, use_all_algorithm = false) {
        let decomposed_field = new DecomposedField(this, cell_width, cell_height, use_all_algorithm)

        if (decomposed_field.composing_error_message) {
            return decomposed_field.composing_error_message
        }

        this.decomposed_field = decomposed_field
        return null
    }


}

