# Author: Johannes Goetze
# Repository: https://github.com/jgoetze/dl_foundation

class DataLayerFoundation
  constructor: () ->
    @event_prefix = "dlf."

    @viewport_element_selector = "[id], form, header, main, footer"
    @click_element_selector    = "button, a, input, [id]"
    @form_element_selector     = "form"

    # working variables
    @bound      = false
    @event_list = {}

  # Bind to the Events
  # until this function is called, no active tracking happens
  bind: ->
    return if @bound
    dlf = @

    ##########################################################
    # Bind Viewport Tracking #################################
    ##########################################################

    objects_to_watch = document.querySelectorAll(@viewport_element_selector)
    observer = new IntersectionObserver(@intersectionCallback)
    i = 0
    for object in objects_to_watch
      object.dataset.dlfObjectID = "dlf-#{i}"
      observer.observe(object)
      i++

    ##########################################################
    # Bind Click Tracking ####################################
    ##########################################################

    objects_to_watch = document.querySelectorAll(@click_element_selector)
    for object in objects_to_watch
      object.addEventListener "click", -> dlf.clickCallback(this)

    ##########################################################
    # Bind Form Tracking #####################################
    ##########################################################

    forms_to_watch = document.querySelectorAll(@form_element_selector)
    for form in forms_to_watch
      form.addEventListener "input", -> dlf.formInputCallback(this)
      form.addEventListener "submit", -> dlf.formSubmitCallback(this)

    @bound = true

  # Called on Form Input
  formInputCallback: (form) =>
    @createEvent(form, 'receivedInput')

  # Called on Form Submit
  formSubmitCallback: (form) =>
    @createEvent(form, 'receivedSubmit')

  # Called on Click
  clickCallback: (object) =>
    @createEvent(object, 'clicked', false)

  # Called on Intersection
  intersectionCallback: (entries) =>
    for observation in entries
      object = observation.target

      # object is intersecting
      if observation.isIntersecting
        @createEvent(object, 'enteredViewport')

      # object is not intersecting ANYMORE
      else if @eventHappened(object, 'enteredViewport')
        @createEvent(object, 'leftViewport')

  # Checks event log and creates a new event if needed
  createEvent: (object, event, single = true) =>
    return if single && @eventHappened(object, event)

    @addEventHappening(object, event)
    @pushEvent(event, {
      triggerTagName: object.tagName,
      triggerId: object.getAttribute('id'),
      triggerName: object.getAttribute('name'),
      triggerEvent: @generateEventLabel(object, event)
    })

  # Generates trigger event label
  generateEventLabel: (object, event) =>
    name = object.getAttribute('name') || object.getAttribute('id') || object.tagName
    event_string = event.split(/(?=[A-Z])/).join(" ")

    "#{name} #{event_string}".toLowerCase()

  # Adds event happening to event log
  addEventHappening: (object, event) =>
    @event_list[@getEventKey(object, event)] = true

  # Checks event log for event happening
  eventHappened: (object, event) =>
    @event_list[@getEventKey(object, event)] == true

  # Creates a unique lookup key for an event
  getEventKey: (object, event) =>
    "#{object.dataset.dlfObjectID}//#{event}"

  # Push an event to the data layer
  pushEvent: (event, eventData = {}) =>
    data = Object.assign(eventData, {'event': "#{@event_prefix}#{event}"})
    dataLayer.push(data)

# Basic initialization
window.dlf = new DataLayerFoundation()
window.dlf.bind()