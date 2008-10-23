
var JSF_Renderer = new Class({

	Implements: Events,

	/*
	* Configuration
	*/
	NUM_TESTS: 200,

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
	
	buffer: null,

	initialize: function(str_canvas_id) {
	
		// store canvas and drawing context reference
		this.elm_canvas = $(str_canvas_id);
		this.obj_canvas_ctx = this.elm_canvas.getContext('2d');
		
		// pre-calculate colour table for non-Mandelbrot points
		this.arr_colours = new Array();
		
		for (var i = 0; i < this.NUM_TESTS; i++) {

            //this.arr_colours[i] = new Color('#f00').mix([0,255,0], (100/this.NUM_TESTS) * i).mix([0,0,255], 100 - ((100/this.NUM_TESTS) * i));

            var int_mod = 765 * i / this.NUM_TESTS;
            var arr_colour;
            
            if (int_mod > 510) {
                arr_colour = [255, 255, (int_mod % 255).toInt()];
            }
            else {
                if (int_mod > 255) {
                    arr_colour = [255, (int_mod % 255).toInt(), 0];
                }
                else {
                    arr_colour = [(int_mod % 255).toInt(), 0, 0];
                }
            }
            
            // force last index to black (represents non-escaping orbits - i.e. part of the set)
            if(i == this.NUM_TESTS -1) {
                arr_colour = [0, 0, 0];
            }
            
            // [0] Red component
            // [1] Green component
            // [2] Blue component
            // [3] RGB(r,g,b) string (used for browsers without canvas getImageData method)
            this.arr_colours[i] = arr_colour.concat(['rgb(' + arr_colour[0] + ',' + arr_colour[1] + ',' + arr_colour[2] + ')']);
        }
	},

	render: function(obj_plane_coords, int_y_start) {
	
        // cache canvas size
        var int_screen_width = this.elm_canvas.getProperty('width');
        var int_screen_height = this.elm_canvas.getProperty('height');

		if(!int_y_start) {
			int_y_start = 0;
			this.int_start_time = $time();
            
            if(this.obj_canvas_ctx.getImageData) {
                this.obj_canvas_ctx.clearRect(0, 0, int_screen_width, int_screen_height);
                this.buffer = this.obj_canvas_ctx.getImageData(0, 0, int_screen_width, int_screen_height);
            }
            else {
                this.buffer = null;
            }
		}
	
	  	var int_start_time = $time();

		var int_plane_x_size = Math.abs(obj_plane_coords.x[1] - obj_plane_coords.x[0]);
        var int_plane_y_size = Math.abs(obj_plane_coords.y[1] - obj_plane_coords.y[0]);
	
		var int_convert_x_ratio = int_screen_width / int_plane_x_size;
        var int_convert_y_ratio = int_screen_height / int_plane_y_size;
		
		var buffer = this.buffer;
		var obj_calculated = this.obj_calculated;

	    for(var int_y = int_y_start; int_y < int_screen_height; int_y++) {
	
			// we've processed a row, do we now need to take a break to give the browser UI a chance to update?
			if(($time() - int_start_time) > 5000) {
				console.info('Taking a break on row: ' + int_y);
				
                if(this.obj_canvas_ctx.getImageData) {
                    this.obj_canvas_ctx.putImageData(buffer, 0, 0);
                }
                
				this.render.delay(1, this, [obj_plane_coords, int_y]);
				return;
			}
	
			for(var int_x = 0; int_x < int_screen_width; int_x++) {
                
				var plane_x = obj_plane_coords.x[0] + (int_x / int_convert_x_ratio);
                var plane_y = (obj_plane_coords.y[0] + (int_y / int_convert_y_ratio)) * -1;
			
				// calculate iterations
				var z_x = plane_x;
				var z_y = plane_y;
				
				for(var i = 0; i < this.NUM_TESTS - 1; i++) {
				
					var int_z_x_squared = z_x * z_x;
					var int_z_y_squared = z_y * z_y;
					
                    // has this coordinate escaped? we can skip further calculations if so
                    if(int_z_x_squared + int_z_y_squared > 4) {
                        break;
                    }
                    
					// calculate next values of z
                    z_y = 2 * z_x * z_y + plane_y;
                    z_x = int_z_x_squared - int_z_y_squared + plane_x;      
				}
                
                // determine colour array to use
                var arr_colour = this.arr_colours[i];
		
	            if(!this.obj_canvas_ctx.getImageData) {
                    
                    // rgb string is stored in the 4th index
                    this.obj_canvas_ctx.fillStyle = arr_colour[3];
                    this.obj_canvas_ctx.fillRect(int_x, int_y, 1, 1);
                }
                else {
               
    				// plot the point at the correct index in the buffer
                    var int_offset = (int_y * int_screen_width + int_x) * 4;

    				buffer.data[int_offset] = arr_colour[0];
    				buffer.data[int_offset + 1] = arr_colour[1];
    				buffer.data[int_offset + 2] = arr_colour[2];
                    
                    // always full opacity
    				buffer.data[int_offset + 3] = 255;
                }
			}
		}
		
        // if we're directly manipulating the pixels we need to copy over what we've
        // calculated thus far
        if(this.obj_canvas_ctx.getImageData) {
    		this.obj_canvas_ctx.clearRect(0, 0, int_screen_width, int_screen_height);
    		this.obj_canvas_ctx.putImageData(buffer, 0, 0);	
        }
		
		// we've completed the render - fire completion event, passing the time taken
		this.fireEvent('onRenderComplete', ($time() - this.int_start_time));
	}

});