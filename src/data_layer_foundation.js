// Author: Johannes Goetze
// Repository: https://github.com/jgoetze/dl_foundation
    
class DataLayerFoundation {
    static debug = false;

    constructor() {
        this.event_prefix = "dlf.";
    
        this.viewport_element_selector = "[id], form, header, main, footer";
        this.click_element_selector    = "button, a, input, [id]";
        this.input_element_selector    = "input, select, textarea";
        this.form_element_selector     = "form";
    
        // working variables
        this.bound      = false;
        this.event_list = {};
    }

    // Creates a unique lookup key for an event
    static getEventKey(object, event) {
        return object.dataset.dlfObjectID + "//" + event;
    }

    // Generates trigger event label
    static getEventLabel(object, event) {
        let name = object.getAttribute('name') || object.getAttribute('id') || object.tagName;
        let event_string = event.split(/(?=[A-Z])/).join(" ");

        return (name + " " + event_string).toLowerCase();
    }

    // Bind to the Events
    // until this function is called, no active tracking happens
    bind() {
        if (!window.IntersectionObserver) return;
        if (this.bound) return;

        let dlf = this;

        //////////////////////////////////////////////////////////
        // Init DataLayer ////////////////////////////////////////
        //////////////////////////////////////////////////////////
        window.dataLayer = window.dataLayer || [];


        //////////////////////////////////////////////////////////
        // Bind Viewport Tracking ////////////////////////////////
        //////////////////////////////////////////////////////////

        let viewport_objects_to_watch = document.querySelectorAll(this.viewport_element_selector);
        let observer = new IntersectionObserver(function(entries) {
            entries.forEach(function (observation) {
                let object = observation.target;

                // object is intersecting
                if (observation.isIntersecting) {
                    dlf.createEvent(object, 'enteredViewport');
                }
                // object is not intersecting ANYMORE
                else if (dlf.eventHappened(object, 'enteredViewport')) {
                    dlf.createEvent(object, 'leftViewport');
                }
            });
        });

        viewport_objects_to_watch.forEach(function(object, index) {
            object.dataset.dlfObjectID = "dlf-" + index;
            observer.observe(object);
        });


        //////////////////////////////////////////////////////////
        // Bind Click Tracking ///////////////////////////////////
        //////////////////////////////////////////////////////////

        let click_objects_to_watch = document.querySelectorAll(this.click_element_selector);
        click_objects_to_watch.forEach(function(object) {
            object.addEventListener("click", function() {
                dlf.createEvent(object, 'receivedClick', false);
            });
        });


        //////////////////////////////////////////////////////////
        // Bind Input Tracking ///////////////////////////////////
        //////////////////////////////////////////////////////////

        let input_objects_to_watch = document.querySelectorAll(this.input_element_selector);
        input_objects_to_watch.forEach(function(object) {
            object.addEventListener("input", function() {
                dlf.createEvent(object, 'receivedInput', false);
            });
        });


        //////////////////////////////////////////////////////////
        // Bind Form Tracking ////////////////////////////////////
        //////////////////////////////////////////////////////////

        let forms_to_watch = document.querySelectorAll(this.form_element_selector);
        forms_to_watch.forEach(function(form) {
            form.addEventListener("submit", function() {
                dlf.createEvent(form, 'receivedSubmit');
            });
        });


        this.bound = true
    }

    // Checks event log and creates a new event if needed
    createEvent(object, event, single = true) {
        if (single && this.eventHappened(object, event)) return;

        this.addEventHappening(object, event);
        this.pushEvent(event, {
            triggerTagName: object.tagName,
            triggerId: object.getAttribute('id'),
            triggerName: object.getAttribute('name'),
            triggerEvent: DataLayerFoundation.getEventLabel(object, event)
        });
    }

    // Adds event happening to event log
    addEventHappening(object, event) {
        this.event_list[DataLayerFoundation.getEventKey(object, event)] = true;
    }

    // Checks event log for event happening
    eventHappened(object, event) {
        return this.event_list[DataLayerFoundation.getEventKey(object, event)] === true;
    }

    // Push an event to the data layer
    pushEvent(event, eventData = {}) {
        let data = Object.assign(eventData, {
            'event': this.event_prefix + event
        });

        window.dataLayer.push(data);

        if (DataLayerFoundation.debug) {
            console.log("DLF", "pushEvent", data);
        }
    }
}

// Basic initialization
DataLayerFoundation.debug = false;
window.data_layer_foundation = new DataLayerFoundation();
window.data_layer_foundation.bind();