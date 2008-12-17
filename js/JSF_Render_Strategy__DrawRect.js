/*
 * Rendering strategy: DrawRect
 * 
 * Creates an image by using the fillRect method of the canvas element for each
 * pixel. This is ... slow!
 * 
 * See parent class for documentation on initialize, start, render and complete methods.
 */
var JSF_Render_Strategy__DrawRect = new Class({
	
    Extends: JSF_Render_Strategy,
    
    initialize: function(str_canvas_id) {

        this.parent(str_canvas_id, 'DrawRect');
    },

    render: function(int_row_idx, arr_data) {
        
        for(var i = 0, ilen = arr_data.length; i < ilen; i++) {
            
            // rgb string is stored in the 4th index
            this.obj_canvas_ctx.fillStyle = arr_data[i][3];
            this.obj_canvas_ctx.fillRect(i, int_row_idx, 1, 1);
        }
    }
});


