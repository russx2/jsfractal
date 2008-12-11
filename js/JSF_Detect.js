
var JSF_Detect = new Class({
    
    initialize: function(str_canvas_id) {
        /*
        var elm_canvas = $(str_canvas_id);
        var elm_canvas_ctx = elm_canvas.getContext('2d');
        */
        // optimum
        JSF_Detect.HAS_PIXEL_MANIPULATION = 1==1/*elm_canvas_ctx.getImageData*/ ? false : false;
        
        // second best
        JSF_Detect.HAS_DATA_URLS = true;
    }
    
});
