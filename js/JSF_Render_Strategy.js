
var JSF_Render_Strategy = new Class({
	
    Implements: Events,
    
    str_canvas_id: null,
    obj_canvas_ctx: null,
    
    int_screen_width: null,
    int_screen_height: null,
    
    int_start_time: null,
    
    initialize: function(str_canvas_id, str_name) {
        
        this.str_canvas_id = str_canvas_id
        
        console.info('Setting render strategy: ' + str_name);
    },
    
    start: function(int_screen_width, int_screen_height) {
        
        // retrieve a drawing context
        this.obj_canvas_ctx = $(this.str_canvas_id).getContext('2d');
        
        // cache canvas width/height values
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


