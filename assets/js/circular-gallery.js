import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'https://cdn.skypack.dev/ogl';

class CircularGallery {
  constructor(container, options = {}) {
    const {
      bend = 3,
      textColor = "#ffffff",
      borderRadius = 0.05,
      scrollEase = 0.05,
      items = [
        { image: "assets/img/home-03/gallery/gal-1.jpg", text: "Project 1" },
        { image: "assets/img/home-03/gallery/gal-2.jpg", text: "Project 2" },
        { image: "assets/img/home-03/gallery/gal-3.jpg", text: "Project 3" },
        { image: "assets/img/home-03/gallery/gal-4.jpg", text: "Project 4" },
        { image: "assets/img/home-03/gallery/gal-5.jpg", text: "Project 5" }
      ]
    } = options;

    this.container = container;
    this.scrollSpeed = 2;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.isDown = false;
    this.items = items;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;

    this.init();
  }

  init() {
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.createGeometry();
    this.createGallery();
    this.addEventListeners();
    this.onResize();
    this.update();
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.position.z = 15;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.geometry = new Plane(this.gl, {
      widthSegments: 20,
      heightSegments: 20,
    });
  }

  createGallery() {
    this.items = this.items.map((item, i) => {
      const mesh = new Mesh(this.gl, {
        geometry: this.geometry,
        program: new Program(this.gl, {
          vertex: \`
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          \`,
          fragment: \`
            precision highp float;
            uniform sampler2D tMap;
            varying vec2 vUv;
            void main() {
              gl_FragColor = texture2D(tMap, vUv);
            }
          \`,
          uniforms: {
            tMap: { value: new Texture(this.gl) },
          },
        }),
      });

      // Load image
      const image = new Image();
      image.src = item.image;
      image.onload = () => {
        mesh.program.uniforms.tMap.value.image = image;
      };

      mesh.position.x = i * 2 - (this.items.length - 1);
      mesh.setParent(this.scene);

      return mesh;
    });
  }

  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * 0.01;
    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    this.isDown = false;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);

    this.items.forEach((mesh, i) => {
      const x = i * 2 - (this.items.length - 1);
      mesh.position.x = x - this.scroll.current;

      if (this.bend !== 0) {
        const z = Math.cos((mesh.position.x / this.items.length) * Math.PI) * this.bend;
        mesh.position.z = z;
        mesh.rotation.y = mesh.position.x * 0.1;
      }
    });

    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    });
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    this.container.addEventListener('mousedown', this.onTouchDown.bind(this));
    window.addEventListener('mousemove', this.onTouchMove.bind(this));
    window.addEventListener('mouseup', this.onTouchUp.bind(this));
    this.container.addEventListener('touchstart', this.onTouchDown.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this));
    window.addEventListener('touchend', this.onTouchUp.bind(this));
  }
}

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

window.CircularGallery = CircularGallery;
