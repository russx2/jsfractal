/**
 * Events fired:
 * 
 *     * onComplete
 *       Fired once the render has completed
 */
var JSF_Render_Strategy = new Class({
	
    Implements: Events,
    
    str_canvas_id: null,
    obj_canvas_ctx: null,
    
    int_screen_width: null,
    int_screen_height: null,
    
    int_start_time: null,
    
    /**
     * Constructor
     * 
     * Assumed to be called from an extended method.
     * 
     * @param str str_canvas_id
     * @param str str_name
     * 
     * @return void
     */
    initialize: function(str_canvas_id, str_name) {
        
        this.str_canvas_id = str_canvas_id
        
        console.info('Setting render strategy: ' + str_name);
    },
    
    /**
     * Called prior to rendering any chunks of the fractal. Sets up anything
     * necessary for the particular rendering strategy.
     * 
     * Records the time so we can determine how long the render took once
     * it has completed.
     * 
     * Designed to be extended in the child class.
     * 
     * @param int int_screen_width   Width of the canvas to render to
     * @param int int_screen_height  Height of the canvas to render to
     * 
     * @return void
     */
    start: function(int_screen_width, int_screen_height) {
        
        // retrieve a drawing context
        this.obj_canvas_ctx = $(this.str_canvas_id).getContext('2d');
        
        // cache canvas width/height values
        this.int_screen_width = int_screen_width;
        this.int_screen_height = int_screen_height;
        
        // time tracking
        this.int_start_time = $time();
    },
    
    /**
     * Renders a row of the fractal
     * 
     * Designed to be extended in the child class.
     * 
     * @param int int_row_idx  Index of the row to render
     * @param arr arr_data     Data to use for the render
     * 
     * @return void
     */
    render: function(int_row_idx, arr_data) {
        
    },
    
    /**
     * Called when a render has completed so we can clean up if necessary or
     * perform any post-processing functions.
     * 
     * Designed to be extended in the child class.

     * @return void
     */
    complete: function() {
    
        this._fire_completed();
    },
    
    /**
     * Utility method (private) to fire the on completion event
     * 
     * @event onComplete  Passes the time taken (ms) as the argument
     */
    _fire_completed: function() {
        
        this.fireEvent('onComplete', $time() - this.int_start_time)
    }
    
});


