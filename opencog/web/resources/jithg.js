var labelType, useGradients, nativeTextSupport, animate, fd, json, selectedId;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) {
      this.elem = document.getElementById('log');
      //this.elem.innerHTML = text; //TODO fix whatever this does
      //this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    }
  }
};

function addAtom(handle) {
  $.ajax({url:"/rest/0.3/atom/"+handle,
    //async:false, //TODO make this not have to happen
    dataType:"json",success:function (data,textStatus,XMLHttpRequest) {
      var atom = {
        id:data.handle, 
        name:data.name, 
        type:data.type,
        lti:data.lti,
        sti:data.sti,
        truthvalue:data.truthvalue,
        adjacencies:[],
        data: {
          "$color": "#83548B",
          "$type": "circle",
          "$dim": 10
        }
      }
      atom.outgoing = data.outgoing;
      //recursively load outgoing nodes and add the adjacencies
      $.each(data.outgoing, function(i, val) {
        atom.adjacencies.push({
          "nodeTo": val,
          "nodeFrom": data.handle,
          "data": {
            "$color": "#557EAA"
          }
        });
        if (!atomExists(val)) {
          addAtom(val);
        }
      });
      atom.incoming = data.incoming;
      //recursively load outgoing nodes and add the adjacencies
      $.each(data.incoming, function(i, val) {
        atom.adjacencies.push({
          "nodeTo": data.handle,
          "nodeFrom": val,
          "data": {
            "$color": "#557EAA"
          }
        });
        if (!atomExists(val)) {
          addAtom(val);
        }
      });

      json.push(atom);
      //display the graph
      //TODO make this load better, not each time
      displayAtomspace(); 
    } 
  });

}

function atomExists(handle) {
  var exists = false;
  $.each(json, function(i, val) {
    if (val.id == handle) {
      exists = true;
    }
  });
  return exists;
}

function getAtom(handle) {
  var atom = null;
  $.each(json, function(i, val) {//TODO short circuit this
    if (val.id == handle) {
      atom=val;
    }
  });
  return atom;
}

function tvToString(tv) {
    var result = "";
    if (tv.hasOwnProperty("simple")) {
        result += "SimpleTV [strength: " + tv.simple.str;
        result += " confidence: " + tv.simple.conf + "]";
    }
    return result;
}


function init(){

  //root atom to start from
  //TODO extend API to find a root node
  var root = 38;
  json = [];

  //recursively adds atoms to the list
  addAtom(root);

  // end
  // init ForceDirected
  fd = new $jit.ForceDirected({
    //id of the visualization container
    injectInto: 'visualview',
    //Enable zooming and panning
    //by scrolling and DnD
    Navigation: {
      enable: true,
      //Enable panning events only if we're dragging the empty
      //canvas (and not a node).
      panning: 'avoid nodes',
      zooming: 10 //zoom speed. higher is more sensible
    },
    // Change node and edge styles such as
    // color and width.
    // These properties are also set per node
    // with dollar prefixed data-properties in the
    // JSON structure.
    Node: {
      overridable: true
    },
    Edge: {
      overridable: true,
      color: '#23A4FF',
      lineWidth: 2
    },
    //Native canvas text styling
    Label: {
      type: labelType, //Native or HTML
      size: 10,
      style: 'bold'
    },
    //Add Tips
    Tips: {
      enable: true,
      onShow: function(tip, node) {
        //count connections
        var count = 0;
        node.eachAdjacency(function() { count++; });
        //display node info in tooltip
        tip.innerHTML = '<div class="tip-title">UUID: ' + node.id + "</div>"
          + '<div class="tip-text">Connections: ' + count + "</div>";
      }
    },
    // Add node events
    Events: {
      enable: true,
      type: 'Native',
      //Change cursor style when hovering a node
      onMouseEnter: function() {
        fd.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        fd.canvas.getElement().style.cursor = '';
      },
      //Update node positions when dragged
      onDragMove: function(node, eventInfo, e) {
          var pos = eventInfo.getPos();
          node.pos.setc(pos.x, pos.y);
          fd.plot();
      },
      //Implement the same handler for touchscreens
      onTouchMove: function(node, eventInfo, e) {
        $jit.util.event.stop(e); //stop default touchmove event
        this.onDragMove(node, eventInfo, e);
      },
      //Add also a click handler to nodes
      onClick: function(node) {
        if(!node) return;
        var atom = getAtom(node.id);
        $('#atomuuid').html(atom.id);
        $('#atomtype').html(atom.type);
        $('#atomsti').html(atom.sti);
        $('#atomlti').html(atom.lti);
        $('#atomname').html(atom.name);
        $('#atomtv').html(tvToString(atom.truthvalue));
        if (selectedId)
          $('#'+selectedId).removeClass("info");
        selectedId = atom.id;
        $('#'+atom.id).addClass("info");

      }
    },
    //Number of iterations for the FD algorithm
    iterations: 200,
    //Edge length
    levelDistance: 130,
    // Add text to the labels. This method is only triggered
    // on label creation and only for DOM labels (not native canvas ones).
    onCreateLabel: function(domElement, node){
      domElement.innerHTML = node.name;
      var style = domElement.style;
      style.fontSize = "0.8em";
      style.color = "#ddd";
    },
    // Change node styles when DOM labels are placed
    // or moved.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style;
      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
      style.left = (left - w / 2) + 'px';
      style.top = (top + 10) + 'px';
      style.display = '';
    }
  });
  
  // end
}

function displayAtomspace() {
  //populate the list
  var list = "";
  $.each(json, function(i, val) {
    list += '<tr id="'+val.id+'">';
    list += '<td>'+val.id+'</td>';
    list += '<td>'+val.type+'</td>';
    list += '<td>'+val.name+'</td>';
    list += '<td>'+tvToString(val.truthvalue)+'</td>';
    list += '<td>'+val.lti+'</td>';
    list += '<td>'+val.sti+'</td>';
    
    list += '<td>';
    $.each(val.incoming, function(i, val) {
      if (i > 0)
        list+=", ";
      list+= val;
    });
    list += '</td>';

    list += '<td>';
    $.each(val.outgoing, function(i, val) {
      if (i > 0)
        list+=", ";
      list+= val;
    });
    list += '</td>';

    list += '</tr>';
    
  });
  $('#atomlist').html(list);
  // load JSON data.
  fd.loadJSON(json);
  // compute positions incrementally and animate.
  fd.computeIncremental({
    iter: 40,
    property: 'end',
    onStep: function(perc){
      Log.write(perc + '% loaded...');
    },
    onComplete: function(){
      Log.write('done');
      fd.animate({
        modes: ['linear'],
        transition: $jit.Trans.Elastic.easeOut,
        duration: 2500
      });
    }
  });
}
