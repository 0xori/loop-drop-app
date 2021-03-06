var ObservStruct = require('mutant/struct')
var KeyCollection = require('lib/key-collection')
var Observ = require('mutant/value')
var Property = require('lib/property')
var Slots = require('lib/slots')
var TemplateSlot = require('lib/template-slot')

var lookup = require('mutant/lookup')
var merge = require('mutant/merge')

var destroyAll = require('lib/destroy-all')

module.exports = ChromaticChunk

function ChromaticChunk (parentContext) {
  var context = Object.create(parentContext)

  var defaultScale = {
    offset: 0,
    notes: [0, 2, 4, 5, 7, 9, 11]
  }

  context.scale = Property(defaultScale)

  var obs = ObservStruct({
    scale: context.scale,
    templateSlot: TemplateSlot(context, context.shape),
    slots: Slots(context),
    inputs: Property([]),
    outputs: Property(['output']),
    midiOutputEnabled: Property(false),
    params: KeyCollection(context),
    selectedSlotId: Observ()
  }, {merge: true})

  obs.slots.onAdd(function (slot) {
    slot.triggerOn(context.audio.currentTime)
  })

  obs.params.context = context
  context.externalChunk = obs
  obs.flags = context.flag
  obs.chokeAll = context.chokeAll
  obs.paramValues = context.paramValues
  obs.context = context

  obs.slotLookup = merge([
    lookup(obs.templateSlot.slots, (x) => x && x['id']),
    lookup(obs.slots, (y) => y && y['id'])
  ])

  obs.spawnParam = function (id) {
    var key = context.fileObject.resolveAvailableParam(id || 'Param 1')
    obs.paramValues.put(key, 0)
    return obs.params.push(key)
  }

  obs.destroy = function () {
    destroyAll(obs)
  }

  return obs
}
