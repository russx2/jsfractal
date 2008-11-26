
var JSF_Renderer = new Class({

	Implements: Events,

	/*
	 * Configuration
	 */
	NUM_TESTS: 200,
    RENDER_TIMEOUT_BREAK: 5000, // ms

	/*
	 * Members
	 */
	elm_canvas: null,
	obj_canvas_ctx: null,
    obj_render_strategy: null,
	
	// drag selection element and drag object
	elm_select: null,
	obj_drag: null,
	
	// stores a lookup of colours for non-Mandelbrot points (depending on escape speed)
	arr_colours: null,

	initialize: function(str_canvas_id) {
	
		// store canvas and drawing context reference
		this.elm_canvas = $(str_canvas_id);
		this.obj_canvas_ctx = this.elm_canvas.getContext('2d');
        
        // determine browser capabilities and choose the fastest rendering strategy
        if(JSF_Detect.HAS_PIXEL_MANIPULATION) {
            this.obj_render_strategy = new JSF_Render_Strategy__ImageData(this.obj_canvas_ctx); 
        }
        else if(JSF_Detect.HAS_DATA_URLS) {
            this.obj_render_strategy = new JSF_Render_Strategy__DataURL(this.obj_canvas_ctx);
        }
        else {
            this.obj_render_strategy = new JSF_Render_Strategy__DrawRect(this.obj_canvas_ctx);
        }
        
        this.obj_render_strategy.addEvent('onComplete', this._event_render_complete.bind(this));
		
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

        // initialise ourselves if this is the first call in the chain of these
        // render methods
		if(!int_y_start) {
			
            // start at first row
            int_y_start = 0;
            
            // notify listeners
            this.fireEvent('onRenderStart');

            // initialise the rendering for the rows
            this.obj_render_strategy.start(int_screen_width, int_screen_height);
		}
	
        // we track our own time throughout this method to avoid triggering
        // script timeout warnings (we give the processor when the time reaches
        // a certain point)
	  	var int_start_time = $time();

		var int_plane_x_size = Math.abs(obj_plane_coords.x[1] - obj_plane_coords.x[0]);
        var int_plane_y_size = Math.abs(obj_plane_coords.y[1] - obj_plane_coords.y[0]);
	
		var int_convert_x_ratio = int_screen_width / int_plane_x_size;
        var int_convert_y_ratio = int_screen_height / int_plane_y_size;

		var obj_calculated = this.obj_calculated;

	    for(var int_y = int_y_start; int_y < int_screen_height; int_y++) {

            var arr_row = new Array();
            
			// we've processed a row, do we now need to take a break to avoid
            // script timeout errors?
			if(($time() - int_start_time) > this.RENDER_TIMEOUT_BREAK) {
				
                // notifier listeners of how much we've done
                this.fireEvent('onRenderPause', Math.round((100 / int_screen_height) * int_y));
                
                // call ourselves again, passing the coordinates we're rendering
                // and where we've got to (the row index)
				this.render.delay(1, this, [obj_plane_coords, int_y]);
                
				return;
			}
	
            // calculate the colour data for this row
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
        
                // store this points colour for rendering at the end of the row
                arr_row[int_x] = this.arr_colours[i];
			}
            
            // render this row using the strategy assigned
            this.obj_render_strategy.render(int_y, arr_row)
		}
        
        // we've calculated all points at this point so let the rendering strategy complete
        this.obj_render_strategy.complete(int_screen_width, int_screen_height);
	},
    
    _event_render_complete: function(int_duration) {
        
        // notify listeners
        this.fireEvent('onRenderComplete', int_duration);
    }
     
});