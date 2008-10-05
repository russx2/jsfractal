
var JSF_History = new Class({
   
    Implements: Events,
    
    arr_history: null,
    int_active_idx: null,
    
    str_history_id: null,
    str_canvas_id: null,
    elm_canvas: null,
    obj_canvas_ctx: null,
    
    initialize: function(str_canvas_id, str_history_id) {
    
        // store canvas reference
        this.str_canvas_id = str_canvas_id;
        this.elm_canvas = $(str_canvas_id);
        this.obj_canvas_cts = $(str_canvas_id).getContext('2d');
        
        // store history id
        this.str_history_id = str_history_id;
        
        // initialise storage
        this.clear();
    },
    
    clear: function() {
    
        this.arr_history = new Array();
        this._get_elements().dispose().destroy();
    },
    
    add: function(obj_plane_coords, obj_canvas_coords) {
    
        var int_screen_width = this.elm_canvas.getProperty('width');
        var int_screen_height = this.elm_canvas.getProperty('height');   
        
        // store current rendering in the history
        var int_history_idx = this.arr_history.length;
        
        // copy the current rendering to store in the history
        var elm_canvas = new Element('canvas', {
            width: int_screen_width,
            height: int_screen_height 
        });
        
        elm_canvas.getContext('2d').drawImage(this.elm_canvas, 0, 0);
        
        this.arr_history[int_history_idx] = {
            elm_canvas: elm_canvas,
            obj_plane_coords: obj_plane_coords,
            obj_selection_coords: obj_canvas_coords
        };
        
        // create new history thumbnail canvas element
        var elm_thumb = (new Element('canvas', {
            'width': 50, 
            'height': 50
        })).inject(this.str_history_id, 'bottom');
        
        // draw current state onto the thumbnail
        elm_thumb.getContext('2d').drawImage(this.elm_canvas, 0, 0, int_screen_width, int_screen_height, 0, 0, 50, 50);

        // store history ID into the thumbnail (for performance reasons)
        elm_thumb.store('idx', int_history_idx);
        
        // assign click handler so we can restore the view
        elm_thumb.addEvent('click', this._event_click_history.bindWithEvent(this));
        
        this.set_active(int_history_idx);
    },
    
    count: function() {
        return this.arr_history.length;
    },
    
    get: function(int_history_idx) {
    
        return this.arr_history[int_history_idx];
    },
    
    get_last: function() {
    
        return this.arr_history[this.arr_history.length - 1];
    },
    
    set_active: function(int_history_idx) {
    
        // retrieve history elements (simultaneously removing any active classes)
        var arr_history = this._get_elements().removeClass('active');
        
        // flag requested item as active
        arr_history[int_history_idx].addClass('active');
        
        // store
        this.int_active_idx = int_history_idx;
    },
    
    get_active: function() {
        return this.int_active_idx;
    },
    
    delete_after_active: function() {

        // remove history data after the active selection
        this.arr_history.splice(this.int_active_idx + 1, this.arr_history.length - 1 - this.int_active_idx);
        
        // update the gui
        var arr_history = this._get_elements();
        
        for(var i = this.int_active_idx + 1, ilen = arr_history.length; i < ilen; i++) {
            arr_history[i].dispose();
        }
    },
    
    _get_elements: function() {
    
        return $(this.str_history_id).getElements('canvas');
    },
    
    _event_click_history: function(obj_event) {
    
        var elm_target = $(obj_event.target);
        
        // retrieve history idx
        var int_history_idx = elm_target.retrieve('idx');
        
        // notify listener
        this.fireEvent('onHistorySelect', int_history_idx);
    },
});

