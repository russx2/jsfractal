
var JSF_Render_Strategy__ImageData = new Class({
	
    Extends: JSF_Render_Strategy,
    
    obj_buffer: null,
    
    initialize: function(str_canvas_id) {

        this.parent(str_canvas_id, 'ImageData');
    },
    
    start: function(int_screen_width, int_screen_height) {
        
        this.parent(int_screen_width, int_screen_height);

        //this.obj_canvas_ctx.clearRect(0, 0, int_screen_width, int_screen_height);
        
        this.obj_buffer = this.obj_canvas_ctx.getImageData(0, 0, int_screen_width, int_screen_height);
        
        
    },
    
    render: function(int_row_idx, arr_data) {
        
        var int_row_width = arr_data.length;
        
        // calculate starting pixel location for the row we're about to render
        // to avoid too much multiplication in the inner loop
        var int_offset_base = int_row_idx * int_row_width;

        for(var i = 0; i < int_row_width; i++) {
            
            var obj_buffer = this.obj_buffer;
            var arr_colour = arr_data[i];
            
            // calculate correct index in the buffer for this point
            var int_offset = (int_offset_base + i) * 4;
    
            // plot R,G,B,A in sequence
            obj_buffer.data[int_offset] = arr_colour[0];
            obj_buffer.data[int_offset + 1] = arr_colour[1];
            obj_buffer.data[int_offset + 2] = arr_colour[2];
            
            // always full opacity
            obj_buffer.data[int_offset + 3] = 255;            
        }
    },
    
    complete: function() {
        
        this.obj_canvas_ctx.clearRect(0, 0, this.int_screen_width, this.int_screen_height);
        this.obj_canvas_ctx.putImageData(this.obj_buffer, 0, 0);

        this.parent();
    }
});


