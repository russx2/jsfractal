
var JSF_Render_Strategy = new Class({
	
    Implements: Events,
    
    obj_canvas_ctx: null,
    int_screen_width: null,
    int_screen_height: null,
    int_start_time: null,
    
    initialize: function(obj_canvas_ctx, str_name) {
        
        this.obj_canvas_ctx = obj_canvas_ctx;
        console.info('Setting render strategy: ' + str_name);
    },
    
    start: function(int_screen_width, int_screen_height) {
        
        this.int_screen_width = int_screen_width;
        this.int_screen_height = int_screen_height;
        
        // time tracking
        this.int_start_time = $time();
    },
    
    render: function(int_row_idx, arr_data) {
        
    },
    
    complete: function() {
    
        this._fire_completed();
    },
    
    _fire_completed: function() {
        
        this.fireEvent('onComplete', $time() - this.int_start_time)
    }
    
});


