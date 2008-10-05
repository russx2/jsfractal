
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

            var v = 765 * i / this.NUM_TESTS;
            
            if (v > 510) {
                this.arr_colours[i] = [255, 255, (v % 255).toInt()];
            }
            else {
                if (v > 255) {
                    this.arr_colours[i] = [255, (v % 255).toInt(), 0];
                }
                else {
                    this.arr_colours[i] = [(v % 255).toInt(), 0, 0];
                }
            }
        }
	},

	render: function(obj_plane_coords, int_y_start) {
	
		if(!int_y_start) {
			int_y_start = 0;
			this.int_start_time = $time();
            
            if(this.obj_canvas_ctx.getImageData) {
                this.obj_canvas_ctx.clearRect(0,0,300,300);
                this.buffer = this.obj_canvas_ctx.getImageData(0, 0, 300, 300);
            }
            else {
                this.buffer = null;
            }
		}
	
	  	var int_start_time = $time();
	
		// pre-calculate some values for optimisation
		var int_screen_width = this.elm_canvas.width;
        var int_screen_height = this.elm_canvas.height;
	
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
				var boo_in_set = true;
	          
				for(var i = 0; i < this.NUM_TESTS; i++) {
				
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
				
				// sanity check
				if (i >= this.NUM_TESTS) {
					//i = i % this.NUM_TESTS;
					i = this.NUM_TESTS - 1;
				}
		
	            if(!this.obj_canvas_ctx.getImageData) {
                    
                    // is it in the set?
                    if(boo_in_set) {
                        this.obj_canvas_ctx.fillStyle = 'black';
                    }
                    else {
                        this.obj_canvas_ctx.fillStyle = 'rgb(' + this.arr_colours[i][0] + ',' + this.arr_colours[i][1] + ',' + this.arr_colours[i][2] + ')';
                    }
                    
                    this.obj_canvas_ctx.fillRect(int_x * 1, int_y * 1, 1, 1);
                }
                else {
               
    				// plot the point
    				//				
    				buffer.data[((int_y * 300 + int_x) * 4) + 0 ] = boo_in_set ? 0 : this.arr_colours[i][0];
    				buffer.data[((int_y * 300 + int_x) * 4) + 1] = boo_in_set ? 0 : this.arr_colours[i][1];
    				buffer.data[((int_y * 300 + int_x) * 4) + 2] = boo_in_set ? 0 : this.arr_colours[i][2];
    				buffer.data[((int_y * 300 + int_x) * 4) + 3] = 255;
                }
				
			}
		}
		
        if(this.obj_canvas_ctx.getImageData) {
    		this.obj_canvas_ctx.clearRect(0,0,300,300);
    		this.obj_canvas_ctx.putImageData(buffer, 0, 0);	
        }
		
		// we've completed the render - fire completion event, passing the time taken
		this.fireEvent('onRenderComplete', ($time() - this.int_start_time));
	}

});