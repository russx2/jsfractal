
var JSFractal = new Class({
	
	str_canvas_id: null,
	
	obj_renderer: null,
	obj_selector: null,
	
	obj_plane_coords: {
	  x: [-2.1, 0.9],
	  y: [-1.5, 1.5]
	},
	
	initialize: function(str_canvas_id) {
		
		this.str_canvas_id = str_canvas_id;
		
		// initialise the renderer
		var obj_renderer = new JSF_Renderer(str_canvas_id);
        
		obj_renderer.addEvent('onRenderComplete', function(int_duration) { console.info('Render complete in: ' + int_duration + 'ms'); });
		obj_renderer.render(this.obj_plane_coords);
		
		// initialise selection functionality
        var obj_selector = new JSF_Selector(str_canvas_id);
        
		obj_selector.addEvent('onSelection', this._event_selection.bind(this));
		
		// store references
		this.obj_renderer = obj_renderer;
		this.obj_selector = obj_selector;
	},
	
	_event_selection: function(obj_selection_coords) {
		
		var obj_canvas_coords = $(this.str_canvas_id).getCoordinates();
		
		var int_plane_x_size = this.obj_plane_coords.x[1] - this.obj_plane_coords.x[0];
		var int_plane_y_size = this.obj_plane_coords.y[1] - this.obj_plane_coords.y[0];
			
		// convert canvas based coordinates to the fractal plane
		var obj_new_coords = {
			x: [
				this.obj_plane_coords.x[0] + ((int_plane_x_size / obj_canvas_coords.width) * obj_selection_coords.x[0]),
				this.obj_plane_coords.x[0] + ((int_plane_x_size / obj_canvas_coords.width) * obj_selection_coords.x[1])
			],
			y: [
				this.obj_plane_coords.y[0] + ((int_plane_y_size / obj_canvas_coords.height) * obj_selection_coords.y[0]),
				this.obj_plane_coords.y[0] + ((int_plane_y_size / obj_canvas_coords.height) * obj_selection_coords.y[1])
			]
		}

		// store new coordinates
		this.obj_plane_coords = obj_new_coords;
		
		this.obj_renderer.render(this.obj_plane_coords);

	}
});
