import _ from 'lodash';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { Vector3 } from 'three';

let main = () => {
    var currentScene = null;
    var mainScene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000);
    
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    document.addEventListener("keydown", onDocumentKeyDown, false);
    
    var xSpeed = 0.0001;
    var ySpeed = 0.0001;

    var resized = false;
    window.addEventListener('resize', function() {
        resized = true
    })

    function resize() {
        resized = false
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        const canvas = renderer.domElement
        camera.aspect = canvas.clientWidth/canvas.clientHeight
        camera.updateProjectionMatrix()
    }
    
    function onDocumentKeyDown(event) {
        if (earth == null) return;
        var keyCode = event.which;
        if (keyCode == 87) {
            camera.position.z += ySpeed;
        } else if (keyCode == 83) {
            camera.position.z -= ySpeed;
        } else if (keyCode == 65) {
            camera.position.x -= xSpeed;
        } else if (keyCode == 68) {
            camera.position.x += xSpeed;
        } else if (keyCode == 32) {
        }
    }

    var earth = null;
    var earthProgress = 0;
    var earthError = null;
    
    var loadingScene = new THREE.Scene();
    currentScene = loadingScene;
    var modelLoader = new GLTFLoader();
    var textureLoader = new THREE.TextureLoader();

    var moonSpriteMap = new THREE.TextureLoader().load( "assets/sprites/moon.png" );
    var moonMaterial = new THREE.SpriteMaterial( { 
        map: moonSpriteMap,
        depthTest: false
    } );

    
    var virusSpriteMap = new THREE.TextureLoader().load( "assets/sprites/coronavirus.png" );
    var virusMaterial = new THREE.SpriteMaterial( { 
        map: virusSpriteMap,
        // depthTest: false,
        transparent: true
    } );

    var moon = new THREE.Sprite( moonMaterial );
    moon.scale.set(10000, 10000, 1);
    moon.position.set(0, -5500, 1000);

    moon.renderOrder = 999;
    moon.animate = function(dTime, elapsedTime) {
        this.material.rotation += THREE.Math.DEG2RAD * -1 * dTime
    }
    mainScene.add(moon);

    var viruses = [];
    for (var i = 0; i < 30; i++) {
        var virusObject = new THREE.Sprite(virusMaterial.clone());
        virusObject.scale.set(100, 100, 1);
        var x = Math.random() * 1600 - 800;
        var y = Math.random() * 1600 + 500;
        var z = Math.random() * 200;
        virusObject.position.set(x, y, z);
        virusObject.renderOrder = z;
        var virus = {
            sceneObject: virusObject,
            moveSpeed: Math.sign(Math.random() - 0.5) * (Math.random() * 4 + 4),
            moveMagnitude: Math.random() * 30 + 30,
            rotateSpeed: Math.sign(Math.random() - 0.5) * (Math.random() * 2 + 2),
            scaleSpeed: Math.sign(Math.random() - 0.5) * (Math.random() * 2 + 2),
            fadeSpeed: Math.random() * 3 + 0.5,
            origin: new Vector3(x, y, z),
            initScale: virusObject.scale.clone(),
            animate: function(dTime, elapsedTime) {
                var object = this['sceneObject'];
                var moveSpeed = this['moveSpeed'];
                var moveMagnitude = this['moveMagnitude']
                var rotateSpeed = this['rotateSpeed'];
                var scaleSpeed = this['scaleSpeed'];
                var fadeSpeed = this['fadeSpeed'];
                var origin = this['origin'];
                var initScale = this['initScale'];
                var newPosition = origin.clone().add(new Vector3(
                    Math.sin(elapsedTime * moveSpeed),
                    Math.cos(elapsedTime * moveSpeed),
                    0
                ).multiplyScalar(moveMagnitude));

                object.position.set(newPosition.x, newPosition.y, newPosition.z);
                object.material.rotation += THREE.Math.DEG2RAD * rotateSpeed * dTime;
                var newScaleValue = Math.abs(Math.sin(elapsedTime * scaleSpeed)) + 0.8;
                object.scale.set(initScale.x * newScaleValue, initScale.y * newScaleValue, initScale.z);
                var newFadeValue = 1-Math.abs(Math.sin(elapsedTime * fadeSpeed));
                object.material.opacity = newFadeValue;
            }
        }
        console.log(virus['fadeSpeed'])
        viruses.push(virus);
        mainScene.add(virusObject);
    }

    mainScene.background = new THREE.Color(0.5, 0.5, 0.5)

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    mainScene.add( light );
    
    modelLoader.load(
        'assets/moon_base/moon_base.gltf',
        function (object) {
            console.log("Loading moon-base complete!");
            console.log(object);
            var moonBase = object.scene
            moonBase.position.set(0, -700, 1200)
            moonBase.scale.set(250,250,250)
            // moonBase.children[0].material = new THREE.MeshBasicMaterial({
            //     color: "rgb(255, 0, 0)"
            // })
            // moonBase.children[1].material = new THREE.MeshBasicMaterial({
            //     color: "rgb(255, 0, 0)"
            // })
            mainScene.add(moonBase)
        }
    )

    modelLoader.load(
        'assets/earth_model/13902_Earth_v1_l3.gltf',
        function (object) {
            console.log("Loading Earth complete!");
            console.log(object);
            textureLoader.load(
                'assets/earth_model/Earth_diff.jpg',
                function (texture) {
                    var material = new THREE.MeshBasicMaterial({
                        map: texture
                    });
                    earth = object.scene.children[0]
                    earth.material = material;
                    mainScene.add(earth);
                    earth.position.set(0, 1300, -200)
                    earth.rotateX(THREE.Math.DEG2RAD * 115)
                    earth.rotateZ(THREE.Math.DEG2RAD * -55)
                    earth.rotateX(THREE.Math.DEG2RAD * 15)
                    earth.animate = function(dTime, elapsedTime) {
                        this.rotateZ(THREE.Math.DEG2RAD * -10 * dTime)
                    }
                    currentScene = mainScene;
                },
                undefined,
                function (err) {
                    console.error("An error occurred loading the texture.");
                }
            )
        },
        function (xhr) {
            earthProgress = xhr.loaded / xhr.total * 100;
            console.log("Progress: " + earthProgress);
        },
        function (error) {
            console.log(error);
            earthError = error;
        }
    );
    
    camera.position.set(0, 0, 2500)
    
    let clock = new THREE.Clock(true);
    function animate() {
        requestAnimationFrame( animate );
        let dTime = clock.getDelta();
        let elapsedTime = clock.getElapsedTime();

        if (resized) {
            resize();
        }

        currentScene.children.filter(x => x.hasProperty('animate')).forEach(element => {
            element.animate(dTime, elapsedTime);
        });

        renderer.render(currentScene, camera);
    }
    animate();
}

if (typeof document !== 'undefined') {
    main();
}
