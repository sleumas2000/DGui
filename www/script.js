var lights
var deviceName = localStorage.getItem('deviceName') || ""
function toggle(light_id) {}

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

var light_request = new XMLHttpRequest()
light_request.open('GET', '/api/lux', true)
light_request.onload = function() {
  response = JSON.parse(this.response)
  if (light_request.status >= 200 && light_request.status < 400 && response.success) {
    lights = response.body
    for (light_id in lights) {
      light = lights[light_id];

      // Create the card div
      const card = document.createElement('div')
      card.setAttribute('class', 'card')
      card.id = "card_"+light_id;

      // Determine whether the light is powered
      if (light.status.powered) {
        card.classList.add("powered")
      } else {
        card.classList.add("unpowered")
      }

      const header = document.createElement('h1')
      header.textContent = light.name

      const button = document.createElement('button')
      button.setAttribute('type', 'button')
      button.textContent = 'Toggle';
      button.onclick = function(){toggle(card.id.substring(5))}; // use the card's ID to get the light ID



      container.appendChild(card)
      card.appendChild(header)
      card.appendChild(button)

      // Determine whether the light is colour-capable and set the colour

      if (light.capabilities.includes("color")) {
        card.classList.add("color")
        var defaultColor = {red:255,green:255,blue:255}
        try {
          if (light.status.color != undefined) {
            defaultColor = light.status.color
          }
        } catch {}
        for (color of ['red','green','blue']) {
          var slider = document.createElement('input')
          slider.id = 'slider_'+light_id+'_color_'+color;
          slider.setAttribute('type', 'range')
          slider.setAttribute('class', color)
          slider.setAttribute('min', 0)
          slider.setAttribute('max', 255)
          slider.setAttribute('step', 1)
          slider.defaultValue = defaultColor[color]
          slider.onmousedown = function(){freeze_slider(this.id)}
          slider.ontouchstart = function(){freeze_slider(this.id)}
          slider.onmouseup = function(){unfreeze_slider(this.id)}
          slider.ontouchend = function(){unfreeze_slider(this.id)}
          var label = document.createElement('div');
          label.setAttribute('class','sliderLabel')
          var text = document.createElement('p');
          text.textContent = color.toProperCase();
          card.appendChild(slider)
          card.appendChild(label)
          label.appendChild(text)
        }
      }
    }
  } else {
    const errorMessage = document.createElement('marquee')
    errorMessage.textContent = 'Gah, it\'s not working!'
    app.appendChild(errorMessage)
  }

  toggle = function(light_id) {
    var toggle_request = new XMLHttpRequest()
    toggle_request.open('PUT', '/api/lux/'+light_id+'/status', true)
    toggle_request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    if (lights[light_id].status.powered) {
      toggle_request.onload = function() {
        lights[light_id].status.powered = false
        const card = document.getElementById('card_'+light_id)
        //card.classList.filter(item => item !== "powered")
        //card.classList.add("unpowered")
        card.classList.replace("powered","unpowered")
        // card.className = card.className.replace(" powered "," unpowered ")
      }
      toggle_request.send(JSON.stringify({powered: false}))
    } else {
      toggle_request.onload = function() {
        lights[light_id].status.powered = true
        const card = document.getElementById('card_'+light_id)
        //card.classList.filter(item => item !== "unpowered")
        //card.classList.add("powered")
        card.classList.replace("unpowered","powered")
      }
      toggle_request.send(JSON.stringify({powered: true}))
    }
  };
}

light_request.send()

function freeze_slider(id) {
  const slider = document.getElementById(id);
  slider.classList.add("clicked")
}
function unfreeze_slider(id) {
  properties = id.split("_")
  light_id = properties[1]
  type = properties[2]
  name = properties[3]
  const slider = document.getElementById(id);
  var slider_request = new XMLHttpRequest()
  slider_request.open('PUT', '/api/lux/'+light_id+'/status', true)
  slider_request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  slider_request.onload = function() {
    slider.classList.remove("clicked")
    // slider.className = slider.className.replace(" clicked ","")
  }
  var status = {}
  status[type]={}
  status[type][name] = parseInt(slider.value);
  console.log(status);
  slider_request.send(JSON.stringify(status))
}

function refresh(){
  var light_request = new XMLHttpRequest()
  light_request.open('GET', '/api/lux?deviceName='+deviceName, true)
  light_request.onload = function() {
    response = JSON.parse(this.response)
    if (light_request.status >= 200 && light_request.status < 400 && response.success) {
      lights = response.body;
      for (light_id in lights) {
        light = lights[light_id];

        // Select the card div
        const card = document.getElementById("card_"+light_id)

        // Determine whether the light is powered
        if (light.status.powered && card.classList.contains("unpowered")) {
          card.classList.replace("unpowered","powered")
          //card.classList.filter(item => item !== "unpowered")
          //card.classList.add("powered")
          //card.className = card.className.replace(" unpowered "," powered ")
        } else if (!light.status.powered && card.classList.contains("powered")) {
          card.classList.replace("powered","unpowered")
          //card.classList.filter(item => item !== "powered")
          //card.classList.add("unpowered")
          //card.className = card.className.replace(" powered "," unpowered ")
        }
        if (light.capabilities.includes("color")) {
          var lightColor = {red:255,green:255,blue:255}
          try {
            if (light.status.color != undefined) {
              lightColor = light.status.color;
            }
          } catch {}
          for (color of ['red','green','blue']) {
            var slider = document.getElementById('slider_'+light_id+'_color_'+color)
            if (!slider.classList.contains("clicked")) {
              slider.value = lightColor[color]
            }
          }
        }
      }
    } else {
      const errorMessage = document.createElement('marquee')
      errorMessage.textContent = 'Gah, it\'s not working!'
      app.appendChild(errorMessage)
    }
  }

  light_request.send()
};
setInterval(refresh, 200);

function setName(name) {
  deviceName = name;
  if (name != "") {
    localStorage.setItem('deviceName',name);
  } else {
    localStorage.removeItem('deviceName');
  }
}

const app = document.getElementById('root')

//const logo = document.createElement('img')
//logo.src = 'logo.png'

const container = document.createElement('div')
container.setAttribute('class', 'container')

const title = document.createElement('h1')
title.textContent = "DGui Development Edition"

const nameBar = document.createElement('div');
nameBar.id = "nameBar";
nameBar.contentEditable = true;
nameBar.textContent = deviceName;
nameBar.onblur = function(){setName(nameBar.textContent)};
app.appendChild(nameBar)

//app.appendChild(logo)
app.appendChild(title)
app.appendChild(container)
