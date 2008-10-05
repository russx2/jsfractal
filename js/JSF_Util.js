
JSF_Util = {
	
	canvas_coords_to_fractal: function(str_canvas_id, obj_plane_coords, obj_selection_coords) {
		
		var obj_canvas_coords = $(str_canvas_id).getCoordinates();

        var int_plane_x_size = obj_plane_coords.x[1] - obj_plane_coords.x[0];
        var int_plane_y_size = obj_plane_coords.y[1] - obj_plane_coords.y[0];
 
		// convert canvas based coordinates to the fractal plane
        var obj_new_coords = {
            x: [
                obj_plane_coords.x[0] + ((int_plane_x_size / obj_canvas_coords.width) * obj_selection_coords.x[0]),
                obj_plane_coords.x[0] + ((int_plane_x_size / obj_canvas_coords.width) * obj_selection_coords.x[1])
            ],
            y: [
                obj_plane_coords.y[0] + ((int_plane_y_size / obj_canvas_coords.height) * obj_selection_coords.y[0]),
                obj_plane_coords.y[0] + ((int_plane_y_size / obj_canvas_coords.height) * obj_selection_coords.y[1])
            ]
        };
	
		return obj_new_coords;
	}
}
