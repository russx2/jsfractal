
var JSF_Renderer = new Class({

	Implements: Events,

	/*
	* Configuration
	*/
	NUM_TESTS: 25,
	GRID_SIZE: 4,
	
	/*
	* Members
	*/
	elm_canvas: null,
	obj_canvas_ctx: null,
	
	// drag selection element and drag object
	elm_select: null,
	obj_drag: null,
	
	// stores a lookup of colours for non-Mandelbrot points (depending on escape speed)
	arr_colours: null,
	
	// stores when a render was started so we can return the time taken once completed
	int_start_time: null,

	initialize: function(str_canvas_id) {
	
		// store canvas and drawing context reference
		this.elm_canvas = $(str_canvas_id);
		this.obj_canvas_ctx = this.elm_canvas.getContext('2d');
		
		// pre-calculate colour table for non-Mandelbrot points
		var obj_colour = new Color('#0f0');
		obj_colour.setBrightness(100);
		this.arr_colours = new Array();
		
		for(var i = 0; i < this.NUM_TESTS; i++) {
			this.arr_colours[i] = 'rgb(' + new Color('#0f0').setBrightness((i*4)) + ')';
		}
	},

	render: function(obj_plane_coords, int_y_start) {
	
		if(!int_y_start) {
			int_y_start = 0;
			this.int_start_time = $time();
		}
	
	  	var int_start_time = $time();
	
		// pre-calculate some values for optimisation
		var int_screen_width = this.elm_canvas.width / this.GRID_SIZE;
		var int_screen_height = this.elm_canvas.height / this.GRID_SIZE;
		var int_plane_x_size = Math.abs(obj_plane_coords.x[1] - obj_plane_coords.x[0]);
		var int_plane_y_size = Math.abs(obj_plane_coords.y[1] - obj_plane_coords.y[0]);
		var int_convert_x_ratio = int_screen_width / int_plane_x_size;
		var int_convert_y_ratio = int_screen_height / int_plane_y_size;
	
	    for(var int_y = int_y_start; int_y < int_screen_height; ++int_y) {
	
			// we've processed a row, do we now need to take a break to give the browser UI a chance to update?
			if(($time() - int_start_time) > 5000) {
				console.info('Taking a break on row: ' + int_y);
				this.render.delay(1, this, [obj_plane_coords, int_y]);
				return;
			}
	
			for(var int_x = 0; int_x < int_screen_width; ++int_x) {
	      
				var plane_x = obj_plane_coords.x[0] + (int_x / int_convert_x_ratio);
				var plane_y = (obj_plane_coords.y[0] + (int_y / int_convert_y_ratio)) * -1;
				
				// calculate iterations
				var z_x = plane_x;
				var z_y = plane_y;
				var boo_in_set = true;
	          
				for(var i = 0; i < this.NUM_TESTS; ++i) {
				
					var int_z_x_squared = z_x * z_x;
					var int_z_y_squared = z_y * z_y;
				
					if(int_z_x_squared + int_z_y_squared > 4) {
				
						boo_in_set = false;
						break;
					}
				
					// calculate next values of z
					z_y = 2 * z_x * z_y + plane_y;
					z_x = int_z_x_squared - int_z_y_squared + plane_x;         
				}
	          
				// is it in the set?
				if(boo_in_set) {
					this.obj_canvas_ctx.fillStyle = 'black';
				}
				else {
					this.obj_canvas_ctx.fillStyle = this.arr_colours[i];
				}
				
				// plot the point
				this.obj_canvas_ctx.fillRect(int_x * this.GRID_SIZE, int_y * this.GRID_SIZE, this.GRID_SIZE, this.GRID_SIZE);
			}
		}
	
		// we've completed the render - fire completion event, passing the time taken
		this.fireEvent('onRenderComplete', ($time() - this.int_start_time));
	}

});