class DecomposedField {
    constructor(field, cell_width, cell_height, use_all_algorithm = false) {
        this.composing_error_message = null

        if ((field.height % cell_height != 0) || (field.width % cell_width != 0)) {
            this.composing_error_message = "Невозможно разбить поле на клетки такого размера!"
            return this
        }

        this.field = []

        this.cell_width = cell_width
        this.cell_height = cell_height

        this.rows = Math.floor(field.height / cell_height)
        this.cols = Math.floor(field.width / cell_width)

        for (let y = 0; y < this.rows; y++) {

            let line = []
            for (let x = 0; x < this.cols; x++) {

                let break_flag = false
                let cell_is_filled = use_all_algorithm

                for (let delta_x = 0; delta_x < cell_width; delta_x++) {
                    for (let delta_y = 0; delta_y < cell_height; delta_y++) {
                        let point = new Point(x * cell_width + delta_x, y * cell_height + delta_y)
                        if (use_all_algorithm && field.point_is_free(point)) {
                            cell_is_filled = false
                            break_flag = true
                        }

                        if ((!use_all_algorithm) && (!field.point_is_free(point))) {
                            cell_is_filled = true
                            break_flag = true
                        }

                        if (break_flag) break
                    }
                    if (break_flag) break
                }

                line.push(cell_is_filled)
            }
            this.field.push(line)
        }

        if (field.robot != null) {
            this.robot = this.decompose_point(field.robot)
            if (this.robot == null) {
                this.composing_error_message = "невозможно разместить робота, что-то ему мешает"
                return this

            }
        }

        this.places = []
        for (let place of field.places) {
            let new_place = this.decompose_point(place)
            if (new_place == null) {
                this.composing_error_message = "невозможно разместить место " + place
                return this

            }
            this.places.push(new_place)
        }
    }

    decompose_point(point) {
        let new_x = Math.floor(point.x / this.cell_width)
        let new_y = Math.floor(point.y / this.cell_height)
        let new_point = new Point(new_x, new_y)
        if (this.is_free_point(new_point)) {
            return new_point
        }
        return null
    }

    get_point_neighbors(point) {
        const [x, y] = point.coordinates
        let neighbors = []//[new Point(x - 1, y), new Point(x + 1, y), new Point(x, y - 1), new Point(x, y + 1)]

        for (let delta_x of [0, -1, 1]) {
            for (let delta_y of [0, -1, 1]) {
                let new_point = new Point(x + delta_x, y + delta_y);
                if ((delta_y != 0 || delta_x != 0) && this.is_valid_point(new_point)) {
                    neighbors.push(new_point)
                }
            }
        }

        return neighbors
    }

    get_cell(point) {
        return this.field[point.y][point.x]
    }

    is_free_point(point) {
        return this.is_valid_point(point) && (!this.get_cell(point))
    }

    is_valid_point(point) {
        return (point.x >= 0) && (point.x < this.cols) && (point.y >= 0) && (point.y < this.rows)
    }

    bfs(start_point, end_point) {
        let copied_field = this.field.map(a => Object.assign({}, a))

        let queue = [start_point];
        let parents = {}
        parents[start_point] = null;

        while (queue.length > 0) {
            const current_point = queue.shift();

            if (current_point.equals(end_point)) {
                const path = [];
                let node = end_point;

                while (node != start_point) {
                    path.unshift(node);
                    node = parents[node];
                }
                path.unshift(start_point);
                return path;
            }

            const neighbors = this.get_point_neighbors(current_point)

            for (let neighbor of neighbors) {
                const [x, y] = neighbor.coordinates
                if (copied_field[y][x] == false) {
                    queue.push(neighbor);
                    copied_field[y][x] = true
                    parents[neighbor] = current_point;
                }
            }

        }

        return null;
    }

    tsp_greedy() {
        let current = this.robot;
        const path = [current];


        while (path.length <= this.places.length) {
            let minimal_distance = Infinity;
            let closest_place = null;
            for (const place of this.places) {
                let distance = current.distance_to(place)
                if (!path.includes(place) && distance < minimal_distance) {
                    minimal_distance = distance;
                    closest_place = place
                }
            }
            path.push(closest_place);
            current = closest_place;
        }
        return path;
    }

    get_adjacency_matrix() {
        let adjacency_matrix = []
        for (let place_1 of this.places) {
            let line = []
            for (let place_2 of this.places) {
                if (place_1.equals(place_2)) {
                    line.push(Infinity)
                } else {
                    let path = this.bfs(place_1, place_2);

                    if (path == null) {
                        line.push(Infinity)
                    } else {
                        line.push(path.length)
                    }
                }
            }
            adjacency_matrix.push(line)
        }
        return adjacency_matrix;
    }

    find_path(point_order = "greedy") {

        let total_path = []

        let places = [this.robot].concat(this.places)
        if (point_order == "greedy") places = this.tsp_greedy()

        for (let i = 0; i < places.length - 1; i++) {
            let path_part = this.bfs(places[i], places[i + 1])

            if (path_part == null) {
                return null
            }

            total_path = total_path.concat(path_part)
        }
        return total_path
    }
}
