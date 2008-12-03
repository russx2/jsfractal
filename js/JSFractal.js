
var JSFractal = new Class({
	
    str_canvas_container_id: null,
	str_canvas_id: null,
	
    // component classes
	obj_renderer: null,
	obj_selector: null,
    obj_history: null,
	obj_gui: null,
    
    // stores the most recently selected canvas coordinates
    obj_canvas_coords: null,
    
    // settings values
    obj_settings: {
    
        plane_coords_initial: {
            x: [-2.1, 0.9],
            y: [-1.5, 1.5]
        },
        
        size: {
            small: { width: 150, height: 150 },
            medium: { width: 300, height: 300 },
            large: { width: 500, height: 500 }
        },
        
        quality: {
            low: { iterations: 10 },
            medium: { iterations: 50 },
            high: { iterations: 3000 }
        }
    },
    
    // current coordinates on the fractal plane
	obj_plane_coords: null,
    
    // set during animations etc. in order to prevent GUI manipulation
    boo_locked: false,
	

	initialize: function(str_canvas_container_id, str_canvas_id, str_history_id) {
		
        this.str_canvas_container_id = str_canvas_container_id;
		this.str_canvas_id = str_canvas_id;

		// initialise the components
        var obj_detect = new JSF_Detect(str_canvas_id);
		var obj_renderer = new JSF_Renderer(str_canvas_id, this.obj_settings.quality.medium.iterations);
        var obj_selector = new JSF_Selector(str_canvas_container_id);
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
        obj_gui.addEvent('onSettingsChange', this._reset.bind(this));
        
        // set initial default plane coordinates
        this.obj_plane_coords = this.obj_settings.plane_coords_initial;
        
		// render initial top level fractal (with default settings)
        this._reset({
            size: 'medium',
            quality: 'medium',
            colours: 'fire'
        });
        
        // temp
        $('play').addEvent('click', this.__play.bind(this));
	},
    
    _reset: function(obj_settings) {
        
        // clear the history
        this.obj_history.clear();
        
        // extract parameters from lookup
        var obj_params_quality = this.obj_settings.quality[obj_settings.quality];
        var obj_params_size = this.obj_settings.size[obj_settings.size];
        
        // set the canvas size (width/height)
        this._create_canvas(obj_params_size.width, obj_params_size.height);
        
        // set renderer iterations
        this.obj_renderer.set_iterations(obj_params_quality.iterations);
        
        // build new colour palette
        this.obj_renderer.build_colour_palette();

        // re-render current fractal
        this.obj_renderer.render(this.obj_plane_coords);
    },
    
    _create_canvas: function(int_width, int_height) {
        
        // remove any existing canvas elements
        $(this.str_canvas_container_id).getElements('canvas').dispose();
        
        // set new dimensions for the container
        $(this.str_canvas_container_id).setStyles({width: int_width, height: int_height});
        
        // create new canvas element and insert into the container
        (new Element('canvas', {
            width: int_width,
            height: int_height,
            id: this.str_canvas_id
        })).inject(this.str_canvas_container_id);
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
        $(this.str_canvas_id).getContext('2d').drawImage(obj_history.elm_canvas, 0, 0);
        
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
        $(this.str_canvas_id).getContext('2d').drawImage(obj_history.elm_canvas, 0, 0);
        
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
