/*
 * Rendering strategy: DataURL
 * 
 * Creates an image from a DataURL before drawing to the canvas
 * 
 * See parent class for documentation on initialize, start, render and complete methods.
 */
var JSF_Render_Strategy__DataURL = new Class({
	
    Extends: JSF_Render_Strategy,
    
    arr_buffer: null,
    
    initialize: function(str_canvas_id) {

        this.parent(str_canvas_id, 'DataURL');
    },
    
    start: function(int_screen_width, int_screen_height) {
        
        this.parent(int_screen_width, int_screen_height);
        
        this.arr_buffer = new Array();
    },
    
    render: function(int_row_idx, arr_data) {
        
        var arr_buffer = this.arr_buffer;
        
        arr_buffer[int_row_idx] = '';
        
        for(var i = 0, ilen = arr_data.length; i < ilen; i++) {
        
            var arr_colour = arr_data[i];
            
            this.arr_buffer[int_row_idx] += String.fromCharCode(arr_colour[2], arr_colour[1], arr_colour[0]);
        }
    },
    
    complete: function() {
        
        this._render_data_url();
    },
    
    /**
     * Utility method to build the canvas graphic from a constructed data URL.
     * 
     * Heavily based on a section of Neil Fraser's JavaScript BMP library:
     * http://neil.fraser.name/software/bmp_lib/bmp_lib.js
     * 
     * @return void
     */
    _render_data_url: function() {
        
         var str_bm_header = 'BMxxxx\0\0\0\0yyyy';
         var str_bm_info = JSF_Util.multi_byte_encode(40,4) + JSF_Util.multi_byte_encode(this.int_screen_width,4) + JSF_Util.multi_byte_encode(this.int_screen_height,4) + '\x01\0' + JSF_Util.multi_byte_encode(24, 2) + '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0';
         var str_data = this.arr_buffer.reverse().join('');
         var str_bm = str_bm_header + str_bm_info + str_data;
        
         str_bm = str_bm.replace(/yyyy/, JSF_Util.multi_byte_encode(str_bm_header.length + str_bm_info.length, 4));
         str_bm = str_bm.replace(/xxxx/, JSF_Util.multi_byte_encode(str_data.length, 4));
        
         var obj_img = new Image();
         obj_img.src = "data:image/bmp;base64," + JSF_Util.base64_encode(str_bm);
         obj_img.onload = (function(obj_img){
             this.obj_canvas_ctx.drawImage(obj_img, 0, 0);
            
             this._fire_completed();
            
         }).bind(this, obj_img);
    }   
});


