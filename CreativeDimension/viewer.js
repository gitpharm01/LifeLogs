//!!!!REMOVED MSIE detecting mechanism
var container, stats;
var camera, scene, renderer, light;
var backLightA, backLightB, ambientLight;
var controls;
var mesh;
var renderer_is_webgl;

//called in the canvas.js to load the resulting 3d model(obj_data) in viewer(viewerId)
function load_viewer(obj_data, viewerId) {
  //call function to initialize html viewer's 3d environment
  load_scene( viewerId );
  //initialize a new OBJloader instance and parce the 3d model(obj_data) to displayable format
  loader = new THREE.OBJLoader();
  object = loader.parse(obj_data);
  object.children[0].geometry.computeFaceNormals();
  geometry = object.children[0].geometry;
  
  // Fixes flip of model for printing, to display it as modelled
  // var flipMatrix = new THREE.Matrix4();
  // flipMatrix.set(-1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
  // geometry.applyMatrix(flipMatrix);
  
  THREE.GeometryUtils.center(geometry);
  //Error prevention for webgl absence
  if (!renderer_is_webgl) {
    mesh = new THREE.SceneUtils.createMultiMaterialObject(
      geometry, [
        new THREE.MeshBasicMaterial({color: 0x067777}), 
        new THREE.MeshBasicMaterial({color: 0x5effff})
      ]
    );
  /*} else if ($.browser.msie) {
    mesh = new THREE.SceneUtils.createMultiMaterialObject(geometry, [new THREE.MeshPhongMaterial( { ambient: 0x888888, color: 0x19A8CB, specular: 0x49D8FB, shininess: 50, perPixel: false, overdraw: true } ), new THREE.MeshBasicMaterial({ color: 0x3388dd } )] ); */
  } else {
    //Otherwise just create the mesh from the geometry(which is generated from obj_data)
    mesh = new THREE.SceneUtils.createMultiMaterialObject(geometry, [new THREE.MeshPhongMaterial( { ambient: 0x444444, color: 0x19A8CB, specular: 0x49D8FB, shininess: 50, perPixel: false, overdraw: true } ), new THREE.MeshBasicMaterial({ color: 0x3388dd, wireframe: true, transparent: true, opacity: 0.15 } )] );
  }
    //light.target = mesh;
  
  //mesh.rotation.y = Math.PI;
  
  /*THREE.SceneUtils.traverseHierarchy(mesh, function (mesh) {
    mesh.doubleSided = true;
	mesh.flipSided = true;
  });
  */
    
	//geometry.castShadow = true;
	//geometry.receiveShadow = true;
  scene.traverse( function(mesh){mesh.doubleSided = true; mesh.flipSided = true;} );
  scene.add(mesh);
  camera.lookAt(geometry);
  light.lookAt(geometry);
  //if (!$.browser.msie) {
    backLightA.lookAt(geometry);
    backLightB.lookAt(geometry);
  //}
  ani(new Date().getTime());
}
//special "animate" function only called in this js file, with some debugging function(now commented)
function ani (t) {
  //  console.log(camera.position.x + " , " + camera.position.y + " , " + camera.position.z);
  //light.target = scene.position;
  requestAnimationFrame(ani, renderer.domElement);
}

function resetViewerCamera () {
  camera.position.set(-40, -40, -150);
}

//get html element and set up viewer environment including scene, camera, and renderer
function load_scene (viewerId) {
  container = document.getElementById(viewerId);
  width = container.style.width.replace('px', '');
  height = container.style.height.replace('px', '');
  
  // Scene & Camera
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(40, width/height, 1, 1000);
  resetViewerCamera();
  scene.add(camera);
  
  light = new THREE.SpotLight();
  light.position.set(40, 80, 150);
  light.castShadow = true;
  scene.add(light);
  
  //if (!$.browser.msie) {
    ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);
    
    backLightA = new THREE.SpotLight();
    backLightA.position.set(-40, -80, -150);
    backLightA.castShadow = false;
    scene.add(backLightA);
    
    backLightB = new THREE.SpotLight();
    backLightB.position.set(80, 40, 150);
    backLightB.castShadow = false;
    scene.add(backLightB);
  //}
  
  // Controls
  controls = new THREE.TrackballControls(camera, container);
  controls.rotateSpeed = 4.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.1;
  controls.keys = [65, 83, 68];
  
  // Renderer
  testCanvas = document.createElement('canvas');
  try {
    if (testCanvas.getContext('experimental-webgl')) {
      renderer_is_webgl = true;
      renderer = new THREE.WebGLRenderer({antialias: true});
    } else {
      renderer_is_webgl = false;
      renderer = new THREE.CanvasRenderer();
    }
  } catch(e) {
    renderer = new THREE.CanvasRenderer();
  }
	renderer.shadowMapEnabled = true;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
}

//Not called in this js file, but called in canvas.js
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  //stats.update();
}
