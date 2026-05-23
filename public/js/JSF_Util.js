
JSF_Util = {
	
    /**
     * Converts the passed canvas selection coordinates to fractal coordinates
     * 
     * @param str str_canvas_id         ID of the canvas element used
     * @param obj obj_plane_coords      Current fractal coordinates of the canvas
     * @param obj obj_selection_coords  Selection coordinates to convert
     * 
     * @return The fractal coordinates of the selection
     */
	canvas_coords_to_fractal: function(str_canvas_id, obj_plane_coords, obj_selection_coords) {

        var int_screen_width = $(str_canvas_id).getProperty('width');
        var int_screen_height = $(str_canvas_id).getProperty('height');

        var int_plane_x_size = obj_plane_coords.x[1] - obj_plane_coords.x[0];
        var int_plane_y_size = obj_plane_coords.y[1] - obj_plane_coords.y[0];
 
		// convert canvas based coordinates to the fractal plane
        var obj_new_coords = {
            x: [
                obj_plane_coords.x[0] + ((int_plane_x_size / int_screen_width) * obj_selection_coords.x[0]),
                obj_plane_coords.x[0] + ((int_plane_x_size / int_screen_width) * obj_selection_coords.x[1])
            ],
            y: [
                obj_plane_coords.y[0] + ((int_plane_y_size / int_screen_height) * obj_selection_coords.y[0]),
                obj_plane_coords.y[0] + ((int_plane_y_size / int_screen_height) * obj_selection_coords.y[1])
            ]
        };

		return obj_new_coords;
	},
    

    /**
     * Encodes a number so it occupies the requested number of byes.
     * 
     * Heavily based on a section of Neil Fraser's JavaScript BMP library:
     * http://neil.fraser.name/software/bmp_lib/bmp_lib.js
     * 
     * @param int number  Number to pad
     * @param int bytes   Number of bytes for the number to occupy
     * 
     * @return Passed number
     */
    multi_byte_encode: function(number, bytes) {
        
        if (number < 0 || bytes < 0) {
            throw('Negative numbers not allowed.');
        }
        
        var oldbase = 1;
        var string = '';
        
        for(var x = 0; x < bytes; x++) {
            
            if (number == 0) {
                byte = 0;
            } 
            else {
                base = oldbase * 256;
                byte = number % base;
                number = number - byte;
                byte = byte / oldbase;
                oldbase = base;
            }
            
            string += String.fromCharCode(byte);
        }
        
        if (number != 0) {
            throw('Overflow, number too big for string length');
        }
        
        return string;
    },
    
    /**
     * Base64 encoder for browsers that do not support the btoa() method.
     * 
     * Heavily based on a section of Neil Fraser's JavaScript BMP library:
     * http://neil.fraser.name/software/bmp_lib/bmp_lib.js
     * 
     * @param str str  String to encode
     * 
     * @return Base64 encoded string
     */
    base64_encode: function(str) {
        
        if(window.btoa) {
            return btoa(str);
        }
        var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        var out, i, len;
        var c1, c2, c3;
    
        len = str.length;
        i = 0;
        out = "";
        while(i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if(i == len)
        {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if(i == len)
        {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }
}
