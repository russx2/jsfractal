
var JSFractal = new Class({
	
	str_canvas_id: null,
    elm_canvas: null,
    obj_canvas_ctx: null,
	
    // component classes
	obj_renderer: null,
	obj_selector: null,
    obj_history: null,
	obj_gui: null,
    
    // stores the most recently selected canvas coordinates
    obj_canvas_coords: null,
    
    // current coordinates on the fractal plane
	obj_plane_coords: {
		x: [-2.1, 0.9],
        y: [-1.5, 1.5]
	},
    
    // set during animations etc. in order to prevent GUI manipulation
    boo_locked: false,
	

	initialize: function(str_canvas_id, str_history_id) {
		
		this.str_canvas_id = str_canvas_id;
        this.elm_canvas = $(str_canvas_id);
        this.obj_canvas_ctx = $(str_canvas_id).getContext('2d');

		// initialise the components
        var obj_detect = new JSF_Detect(str_canvas_id);
		var obj_renderer = new JSF_Renderer(str_canvas_id);
        var obj_selector = new JSF_Selector(str_canvas_id);
        var obj_history = new JSF_History(str_canvas_id, str_history_id);
        var obj_gui = new JSF_GUI(obj_history, str_canvas_id, str_history_id);
        
        // store references
        this.obj_renderer = obj_renderer;
        this.obj_selector = obj_selector;
        this.obj_gui = obj_gui;
        this.obj_history = obj_history;
        
        // listen to component events
		obj_renderer.addEvent('onRenderComplete', this._event_render_complete.bind(this));
        obj_renderer.addEvent('onRenderComplete', this.obj_gui.show_loading.bind(this.obj_gui, false));
        obj_renderer.addEvent('onRenderStart', this.obj_gui.show_loading.bind(this.obj_gui, true));
        obj_renderer.addEvent('onRenderPause', this.obj_gui.update_loading.bind(this.obj_gui));
		obj_selector.addEvent('onSelection', this._event_selection.bind(this));
        obj_history.addEvent('onHistorySelect', this._event_go_history.bind(this));
        
        
		// render initial top level fractal
        obj_renderer.render(this.obj_plane_coords);
        
        // temp
        $('play').addEvent('click', this.__play.bind(this));
	},
	
	render: function(obj_selection_coords) {

        this._lock(true);

        // calculate plane coords from the (canvas based) selection coords
        var obj_plane_coords = JSF_Util.canvas_coords_to_fractal(this.str_canvas_id, this.obj_plane_coords, obj_selection_coords);

		// store new coordinates
		this.obj_plane_coords = obj_plane_coords;
        this.obj_canvas_coords = obj_selection_coords;

		// render
		this.obj_renderer.render(obj_plane_coords);
	},
    
    _event_render_complete: function(int_duration) { 
  
        // add this newly rendered fractal to the history
        this.obj_history.add(this.obj_plane_coords, this.obj_canvas_coords);
        
        this._lock(false);
 
        console.info('Render complete in: ' + int_duration + 'ms');
    },
	
	_event_selection: function(obj_selection_coords) {
        
        if(this._is_locked()) {
            return;
        }

        this._lock(true);
                
        // remove any history after this item
        this.obj_history.delete_after_active();

		// show the preview and render
		this.obj_gui.zoom_preview(this.obj_history.get_active(), obj_selection_coords, this.render.bind(this, obj_selection_coords));
	},

    _event_go_history: function(int_history_idx) {

        if(this._is_locked()) {
            return;
        }

        var obj_history = this.obj_history.get(int_history_idx);

        // flag the item as active
        this.obj_history.set_active(int_history_idx);

        // draw history item to the canvas
        this.obj_canvas_ctx.drawImage(obj_history.elm_canvas, 0, 0);
        
        // update current coordinates
        this.obj_plane_coords = obj_history.obj_plane_coords;
    },
    
    __play: function() {
        
        if(this._is_locked()) {
            return true;
        }
        
        // we can't proceed if there's no history to play
        if(this.obj_history.count() <= 1) {
            return;
        }
        
        this._lock(true);
        
        this.obj_gui.__play(this.show_current.bind(this));
    },
    
    show_current: function() {
        
        // retrieve canvas from the history
        var obj_history = this.obj_history.get_last();
        
        // update associated fractal coordinates
        this.obj_plane_coords = obj_history.obj_plane_coords;
        
        // draw to display
        this.obj_canvas_ctx.drawImage(obj_history.elm_canvas, 0, 0);
        
        // set active
        this.obj_history.set_active(this.obj_history.count() - 1);
        
        this._lock(false);
    },
    
    _lock: function(boo) {
        this.boo_locked = boo;
    },
    
    _is_locked: function() {
        return this.boo_locked;
    }

});
