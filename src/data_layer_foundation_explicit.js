// Author: Johannes Goetze
// Repository: https://github.com/jgoetze/dl_foundation

// Available attributes:
// "data-dlfe-entered-viewport"
// "data-dlfe-left-viewport"
// "data-dlfe-received-click"
// "data-dlfe-received-double-click"
// "data-dlfe-received-input"
// "data-dlfe-received-submit"
//
// Usage:
// <div data-dlfe-entered-viewport="this_node_name">
// creates an DL Event like: "this_node_name entered viewport"

class DataLayerFoundationExplicit {
    static debug = false;
    static event_prefix = "dlfe.";

    constructor() {
        this.bound = false;
        window.dataLayer = window.dataLayer || [];
    }

    // Bind to the Events
    // until this function is called, no active tracking happens
    bind() {
        if (this.bound) return;

        if (window.IntersectionObserver) {
            this.bindEnteredViewport();
            this.bindLeftViewport();
        }
        this.bindReceivedClick();
        this.bindReceivedDoubleClick();
        this.bindReceivedInput();
        this.bindReceivedSubmit();

        this.bound = true
    }

    bindEnteredViewport() {
        let dlfe = this;
        let viewport_objects_to_watch = document.querySelectorAll("[data-dlfe-entered-viewport]");

        let observer = new IntersectionObserver(function(entries) {
            entries.forEach(function (observation) {
                if (observation.isIntersecting) {
                    dlfe.createEvent(observation.target.dataset.dlfeEnteredViewport, 'enteredViewport');
                }
            });
        }, {
            threshold: 0.25
        });

        viewport_objects_to_watch.forEach(function(object, index) {
            observer.observe(object);
        });
    }

    bindLeftViewport() {
        let dlfe = this;
        let viewport_objects_to_watch = document.querySelectorAll("[data-dlfe-left-viewport]");

        let observer = new IntersectionObserver(function(entries) {
            entries.forEach(function (observation) {
                if (observation.isIntersecting) {
                    observation.target.dataset.__dlfeWasInViewport = "1";
                } else {
                    if (observation.target.dataset.__dlfeWasInViewport == "1") {
                        observation.target.dataset.__dlfeWasInViewport = "0";
                        dlfe.createEvent(observation.target.dataset.dlfeLeftViewport, 'leftViewport');
                    }
                }
            });
        }, {
            threshold: 0.25
        });

        viewport_objects_to_watch.forEach(function(object, index) {
            observer.observe(object);
        });
    }

    bindReceivedClick() {
        let dlfe = this;
        let click_objects_to_watch = document.querySelectorAll("[data-dlfe-received-click]");
        click_objects_to_watch.forEach(function(object) {
            object.addEventListener("click", function() {
                dlfe.createEvent(object.dataset.dlfeReceivedClick, 'receivedClick');
            });
        });
    }

    bindReceivedDoubleClick() {
        let dlfe = this;
        let click_objects_to_watch = document.querySelectorAll("[data-dlfe-received-double-click]");
        click_objects_to_watch.forEach(function(object) {
            object.addEventListener("dblclick", function() {
                dlfe.createEvent(object.dataset.dlfeReceivedDoubleClick, 'receivedDoubleClick');
            });
        });
    }

    bindReceivedInput() {
        let dlfe = this;
        let input_objects_to_watch = document.querySelectorAll("[data-dlfe-received-input]");
        input_objects_to_watch.forEach(function(object) {
            object.addEventListener("input", function() {
                dlfe.createEvent(object.dataset.dlfeReceivedInput, 'receivedInput');
            });
        });
    }

    bindReceivedSubmit() {
        let dlfe = this;
        let forms_to_watch = document.querySelectorAll("[data-dlfe-received-submit]");
        forms_to_watch.forEach(function(form) {
            form.addEventListener("submit", function() {
                dlfe.createEvent(form.dataset.dlfeReceivedSubmit, 'receivedSubmit');
            });
        });
    }

    // Checks event log and creates a new event if needed
    createEvent(identifier, event) {
        let event_object = {
            event: DataLayerFoundationExplicit.event_prefix + event,
            dlfeProps: {
                nodeIdentifier: identifier,
                interactionType: event
            }
        }

        window.dataLayer.push(event_object);

        if (DataLayerFoundationExplicit.debug) {
            console.log("DLFE", "pushEvent", event_object);
        }
    }
}

// Basic initialization
DataLayerFoundationExplicit.debug = false;
window.data_layer_foundation_explicit = new DataLayerFoundationExplicit();
window.data_layer_foundation_explicit.bind();