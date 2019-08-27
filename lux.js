var lux = require('express').Router();

let lights = {};
lights.fairy = {name:"Fairy Lights", connection:{type: "gpio", power:1, inverted:false},                                             capabilities: []       }
lights.lamp  = {name:"Desk Lamp",    connection:{type: "gpio", power:2, inverted:false},                                             capabilities: []       }
lights.leds  = {name:"LED Strips",   connection:{type: "gpio", power:3, inverted:false, color: {type:"gpio",red:4,green:5,blue:6}},  capabilities: ["color"]}
lights.bed   = {name:"Bed Lights",   connection:{type: "gpio", power:1, inverted:false},                                             capabilities: []       }
lights.desk  = {name:"Desk border",  connection:{type: "gpio", power:7, inverted:false},                                             capabilities: []       }
lights.main  = {name:"Main Lights",  connection:{type: "gpio", power:8, inverted:false, color: {type:"gpio",red:9,green:5,blue:10}}, capabilities: ["color"]}
lights.bonus = {name:"Bonus Light",  connection:{type: "gpio", power:8, inverted:false},                                             capabilities: []       }

var virtualPorts = {1: false, 2: false, 3: false, 4: 255, 5: 255, 6: 255, 7: false, 8: false, 9: 0, 10: 0}

lux.get('/', function(req, res){
  promises = []
  for (l in lights) {
    promise = new Promise( function(resolve, reject) {
      getStatus(lights[l], function callback(status){lights[l].status = status; resolve()}, function err(err) {reject(err)})
    })
    promises.push(promise)
  }
  Promise.all(promises).then(function(){
    res.json({success: true, body: lights});
  }).catch(function(e){
    res.json({success:false, error: e})
  });
});

lux.get('/:id', function(req, res){
  if (!checkLight(req.params.id)) {
    res.status(404).json({success: false, error:"unknown light"})
  }

  let light = lights[req.params.id]

  getStatus(light, function callback(status) {
    res.status(200).json({success: true, name: light.name, status: status})
  }, function err(err) {
    res.status(500).json({success: false, error: err})
  });
});

lux.get('/:id/status', function(req, res){
  if (!checkLight(req.params.id)) {
    res.status(404).json({success: false, error:"unknown light"})
  }

  let light = lights[req.params.id]

  getStatus(light, function callback(status) {
    status.success = true;
    res.status(200).json(status)
  }, function err(err) {
    res.status(500).json({success: false, error: err})
  });
});

lux.put('/:id/status', function(req, res){
  if (!checkLight(req.params.id)) {
    res.status(404).json({success: false, error:"unknown light"})
  }

  setStatus(lights[req.params.id], req.body, function callback() {
    res.status(200).json({success: true});
  }, function err(err) {
    res.status(500).json({success: false, error: err})
  });

});

module.exports = lux

function getStatus(light, callback, err_callback) {
  status = {powered: virtualPorts[light.connection.power]}
  if (light.capabilities.includes('color')) {
    status.color = {red: undefined, green: undefined, blue: undefined}
    for (color of ["red","green","blue"]) {
      status.color[color] = virtualPorts[light.connection.color[color]]
    }
  }
  callback(status)
}

function setStatus(light, status, callback, err_callback) {
  console.log(status);
  if (status.powered !== undefined) {
    virtualPorts[light.connection.power] = status.powered
  }
  if (light.capabilities.includes('color') && status.color !== undefined) {
    for (color of ["red","green","blue"]) {
      if (status.color[color] != undefined) {
        virtualPorts[light.connection.color[color]] = status.color[color]
      }
    }
  }
  callback()
}

function checkLight(id) {
  for (l in lights) {
    if (id == l) { return true}
  }
  return false
}
