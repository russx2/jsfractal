/**
 * Events fired:
 * 
 *     * onHistorySelect
 *       Fired when the user selects a history item
 */
var JSF_History = new Class({
   
    Implements: Events,
    
    arr_history: null,
    int_active_idx: null,
    
    str_history_id: null,
    str_canvas_id: null,
    
    /**
     * Constructor
     * 
     * @param str str_canvas_id   ID of the canvas element to use
     * @param str str_history_id  ID of the history element to use
     * 
     * @return void
     */
    initialize: function(str_canvas_id, str_history_id) {
    
        // store canvas reference
        this.str_canvas_id = str_canvas_id;

        // store history id
        this.str_history_id = str_history_id;
        
        // initialise storage
        this.clear();
    },
    
    /**
     * Clears the current history
     * 
     * @return void
     */
    clear: function() {
    
        this.arr_history = new Array();
        this._get_elements().dispose().destroy();
    },
    
    /**
     * Adds the current fractal to the history (storing the passed plane and
     * canvas coords for future processing).
     * 
     * @param obj obj_plane_coords   Fractal plane coords of this item
     * @param obj obj_canvas_coords  Canvas coords of this item
     * @return void
     */
    add: function(obj_plane_coords, obj_canvas_coords) {
    
        var elm_canvas = $(this.str_canvas_id);
        
        var int_screen_width = elm_canvas.getProperty('width');
        var int_screen_height = elm_canvas.getProperty('height');   
        
        // store current rendering in the history
        var int_history_idx = this.arr_history.length;
        
        // copy the current rendering to store in the history
        var elm_canvas_history = new Element('canvas', {
            width: int_screen_width,
            height: int_screen_height 
        });
        
        elm_canvas_history.getContext('2d').drawImage(elm_canvas, 0, 0);
        
        this.arr_history[int_history_idx] = {
            elm_canvas: elm_canvas_history,
            obj_plane_coords: obj_plane_coords,
            obj_selection_coords: obj_canvas_coords
        };
        
        // create new history thumbnail canvas element
        var elm_thumb = (new Element('canvas', {
            'width': 50, 
            'height': 50
        })).inject(this.str_history_id, 'bottom');
        
        // draw current state onto the thumbnail
        elm_thumb.getContext('2d').drawImage(elm_canvas, 0, 0, int_screen_width, int_screen_height, 0, 0, 50, 50);

        // store history ID into the thumbnail (for performance reasons)
        elm_thumb.store('idx', int_history_idx);
        
        // assign click handler so we can restore the view
        elm_thumb.addEvent('click', this._event_click_history.bindWithEvent(this));

        this.set_active(int_history_idx);
    },
    
    /**
     * Returns the current history length
     * 
     * @return Number of items in the history
     */
    count: function() {
        return this.arr_history.length;
    },
    
    /**
     * Retrieves an item from the history
     * 
     * @param int int_history_idx  Item index to retrieve (0 based index)
     * 
     * @return History object
     */
    get: function(int_history_idx) {
    
        return this.arr_history[int_history_idx];
    },
    
    /**
     * Returns the last item from the history
     * 
     * @return History object
     */
    get_last: function() {
    
        return this.arr_history[this.arr_history.length - 1];
    },
    
    /**
     * Sets the requested history index as active
     * 
     * @param int int_history_idx  History index to set
     */
    set_active: function(int_history_idx) {
    
        // retrieve history elements (simultaneously removing any active classes)
        var arr_history = this._get_elements().removeClass('active');
        
        // flag requested item as active
        arr_history[int_history_idx].addClass('active');
        
        // store
        this.int_active_idx = int_history_idx;
    },
    
    /**
     * Retrieves the currently active history item's index
     * 
     * @return History item index
     */
    get_active: function() {
        return this.int_active_idx;
    },
    
    /**
     * Removes all history items AFTER the currently active item
     * 
     * @return void
     */
    delete_after_active: function() {
        
        // remove history data after the active selection
        this.arr_history.splice(this.int_active_idx + 1, this.arr_history.length - 1 - this.int_active_idx);
        
        // update the gui
        var arr_history = this._get_elements();
        
        for(var i = this.int_active_idx + 1, ilen = arr_history.length; i < ilen; i++) {
            arr_history[i].dispose();
        }
    },
    
    /**
     * Removes all history items AFTER AND INCLUDING the currently active item
     * 
     * @return void
     */
    delete_from_active: function() {
        
        // remove history data after the active selection
        this.arr_history.splice(this.int_active_idx, this.arr_history.length - 1 - this.int_active_idx + 1);
        
        // update the gui
        var arr_history = this._get_elements();
        
        for(var i = this.int_active_idx, ilen = arr_history.length; i < ilen; i++) {
            arr_history[i].dispose();
        }
        
        this.int_active_idx--;
    },
    
    /**
     * Selects all history canvases from the dom
     * 
     * @return Array of canvas elements
     */
    _get_elements: function() {
    
        return $(this.str_history_id).getElements('canvas');
    },
    
    /**
     * Called when a history item is clicked. Notifies event listeners.
     * 
     * @param obj obj_event Event object
     * 
     * @event onHistorySelect  Notifies listeners, passing the index of the item clicked
     * 
     * @return void
     */
    _event_click_history: function(obj_event) {
    
        var elm_target = $(obj_event.target);
        
        // retrieve history idx
        var int_history_idx = elm_target.retrieve('idx');
        
        // notify listener
        this.fireEvent('onHistorySelect', int_history_idx);
    },
});

