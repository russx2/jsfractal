
var JSF_Detect = new Class({
    
    initialize: function() {

        var elm_canvas = new Element('canvas') || null;
        var elm_canvas_ctx = elm_canvas ? elm_canvas.getContext('2d') : {};

        // optimum
        JSF_Detect.HAS_PIXEL_MANIPULATION = elm_canvas_ctx.getImageData ? true : false;
        
        // second best
        JSF_Detect.HAS_DATA_URLS = true;
    }
    
});
