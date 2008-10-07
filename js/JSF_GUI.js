
var JSF_GUI = new Class({
	
    Implements: [Events, Chain],
    
    // reference to history object
	obj_history: null,
    
    // caching of necessary properties
    str_history_id: null,
    str_canvas_id: null,
    
	elm_canvas: null,
    obj_canvas_ctx: null,
	
	
	initialize: function(obj_history, str_canvas_id, str_history_id) {
		
		this.obj_history = obj_history;
        this.str_history_id = str_history_id;
        
        // save a reference to the canvas and drawing context
        this.str_canvas_id = str_canvas_id;
		this.elm_canvas = $(str_canvas_id);
        this.obj_canvas_ctx = $(str_canvas_id).getContext('2d');
	},
	
	zoom_preview: function(int_history_idx, obj_canvas_coords, fun_callback) {
		
        var obj_history = this.obj_history.get(int_history_idx);

        var elm_canvas = obj_history.elm_canvas;
        
		var int_selection_width = obj_canvas_coords.x[1] - obj_canvas_coords.x[0];
		var int_selection_height = obj_canvas_coords.y[1] - obj_canvas_coords.y[0];

        var obj_zoom = {
            left: obj_canvas_coords.x[0],
            right: this.elm_canvas.getProperty('width') - obj_canvas_coords.x[1],
            top: obj_canvas_coords.y[0],
            bottom: this.elm_canvas.getProperty('height') - obj_canvas_coords.y[1]
        };

        this._zoom_preview(elm_canvas, obj_zoom, obj_canvas_coords, fun_callback, 0);
	},
    
    _zoom_preview: function(elm_canvas, obj_zoom_coords, obj_hack, fun_callback, i) {

        var int_screen_width = this.elm_canvas.getProperty('width');
        var int_screen_height = this.elm_canvas.getProperty('height');

        // tmp
        var obj_canvas_coords = obj_zoom_coords;

        if(i == 41) {
            
            // fire completion callback
            return fun_callback ? fun_callback(obj_hack) : null;
        }

        var flt_x0 = (i * (obj_canvas_coords.left / 40));
        var flt_y0 = (i * (obj_canvas_coords.top / 40));
        var flt_x1 = int_screen_width - ((obj_canvas_coords.right / 40) * i);
        var flt_y1 = int_screen_height - ((obj_canvas_coords.bottom / 40) * i);
        
        // TODO:
        //console.info('bug here');
        this.obj_canvas_ctx.drawImage(elm_canvas, flt_x0, flt_y0, flt_x1 - flt_x0, flt_y1 - flt_y0, 0, 0, int_screen_width, int_screen_height);
    
        this._zoom_preview.delay(5, this, [elm_canvas, obj_zoom_coords, obj_hack, fun_callback, i + 1]);
    },
    
    __play: function(fun_callback) {
        
        var fun_callchain_bind = this.callChain.bind(this);
        var fun_active_history = function(i) {
            this.obj_history.set_active(i);
            this.callChain();
        };
        
        // iterate through each history item except the last
        for(var i = 0, ilen = this.obj_history.count() - 1; i < ilen; i++) {
            
            var obj_history = this.obj_history.get(i); //arr_history[i];
            var obj_history_next = this.obj_history.get(i + 1);
            
            // add chain to: highlight currently animated history thumbnail, call next chain, perform animation
            this.chain(
                fun_active_history.bind(this, i),
                this.zoom_preview.bind(this, [i, obj_history_next.obj_selection_coords, fun_callchain_bind])
            );
        }
        
        // highlight the final item and fire the callback
        this.chain(
            fun_active_history.bind(this, i),
            fun_callback
        );
 
        // execute the chain
        this.callChain();
    
    }
});


