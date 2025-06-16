// Vanilla JS port of GridDistortion originally written for React.
// Usage:
//   const cleanup = GridDistortionInit(containerElement, {
//      imageSrc: 'url', grid: 15, mouse:0.1, strength:0.15, relaxation:0.9
//   });
// Returns a function that removes listeners and frees WebGL resources.

(function(global){
  function GridDistortionInit(container, opts){
    if(!container) return ()=>{};
    const {
      imageSrc,
      grid=15,
      mouse=0.1,
      strength=0.15,
      relaxation=0.9
    } = opts || {};

    const scene=new THREE.Scene();
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    container.appendChild(renderer.domElement);

    const camera=new THREE.OrthographicCamera(0,0,0,0,-1000,1000);
    camera.position.z=2;

    const uniforms={
      time:{value:0},
      resolution:{value:new THREE.Vector4()},
      uTexture:{value:null},
      uDataTexture:{value:null}
    };

    const vertexShader=`
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main(){
          vUv=uv;
          vPosition=position;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        }`;
    const fragmentShader=`
        uniform sampler2D uDataTexture;
        uniform sampler2D uTexture;
        uniform vec4 resolution;
        varying vec2 vUv;
        void main(){
          vec2 uv=vUv;
          vec4 offset=texture2D(uDataTexture,vUv);
          gl_FragColor=texture2D(uTexture,uv-0.02*offset.rg);
        }`;

    const textureLoader=new THREE.TextureLoader();
    const imageAspectRef={current:1};

    const handleResize=()=>{}; // placeholder define later

    textureLoader.load(imageSrc, (texture)=>{
      texture.minFilter=THREE.LinearFilter;
      imageAspectRef.current=texture.image.width/texture.image.height;
      uniforms.uTexture.value=texture;
      handleResize();
    });

    const size=grid;
    const data=new Float32Array(4*size*size);
    for(let i=0;i<size*size;i++){
      data[i*4]=Math.random()*255-125;
      data[i*4+1]=Math.random()*255-125;
    }
    const dataTexture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat,THREE.FloatType);
    dataTexture.needsUpdate=true;
    uniforms.uDataTexture.value=dataTexture;

    const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms,vertexShader,fragmentShader});
    const geometry=new THREE.PlaneGeometry(1,1,size-1,size-1);
    const plane=new THREE.Mesh(geometry,material);
    scene.add(plane);

    const resize=()=>{
      const width=container.offsetWidth;
      const height=container.offsetHeight;
      const containerAspect=width/height;
      const imageAspect=imageAspectRef.current;
      renderer.setSize(width,height);
      const scale=Math.max(containerAspect/imageAspect,1);
      plane.scale.set(imageAspect*scale,scale,1);
      const frustumHeight=1;
      const frustumWidth=frustumHeight*containerAspect;
      camera.left=-frustumWidth/2;
      camera.right=frustumWidth/2;
      camera.top=frustumHeight/2;
      camera.bottom=-frustumHeight/2;
      camera.updateProjectionMatrix();
      uniforms.resolution.value.set(width,height,1,1);
    };
    handleResize=resize; // reassign

    window.addEventListener('resize',resize);

    const mouseState={x:0,y:0,prevX:0,prevY:0,vX:0,vY:0};
    const onMove=(e)=>{
      const rect=container.getBoundingClientRect();
      const x=(e.clientX-rect.left)/rect.width;
      const y=1-(e.clientY-rect.top)/rect.height;
      mouseState.vX=x-mouseState.prevX;
      mouseState.vY=y-mouseState.prevY;
      Object.assign(mouseState,{x,y,prevX:x,prevY:y});
    };
    const onLeave=()=>{
      dataTexture.needsUpdate=true;
      Object.assign(mouseState,{x:0,y:0,prevX:0,prevY:0,vX:0,vY:0});
    };
    container.addEventListener('mousemove',onMove);
    container.addEventListener('mouseleave',onLeave);

    const animate=()=>{
      requestAnimationFrame(animate);
      uniforms.time.value+=0.05;
      const d=dataTexture.image.data;
      for(let i=0;i<size*size;i++){
        d[i*4]*=relaxation;
        d[i*4+1]*=relaxation;
      }
      const gridMouseX=size*mouseState.x;
      const gridMouseY=size*mouseState.y;
      const maxDist=size*mouse;
      for(let i=0;i<size;i++){
        for(let j=0;j<size;j++){
          const dist=Math.pow(gridMouseX-i,2)+Math.pow(gridMouseY-j,2);
          if(dist<maxDist*maxDist){
            const idx=4*(i+size*j);
            const power=Math.min(maxDist/Math.sqrt(dist),10);
            d[idx]+=strength*100*mouseState.vX*power;
            d[idx+1]-=strength*100*mouseState.vY*power;
          }
        }
      }
      dataTexture.needsUpdate=true;
      renderer.render(scene,camera);
    };
    animate();

    const cleanup=()=>{
      container.removeEventListener('mousemove',onMove);
      container.removeEventListener('mouseleave',onLeave);
      window.removeEventListener('resize',resize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      dataTexture.dispose();
      if(uniforms.uTexture.value) uniforms.uTexture.value.dispose();
    };
    return cleanup;
  }

  global.GridDistortionInit=GridDistortionInit;
})(window);
