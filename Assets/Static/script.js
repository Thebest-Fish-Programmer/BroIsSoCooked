/* ---------- Dark mode shadow system with light illumination ----------
   Enhanced for atmospheric dark mode with light-based revelation
----------------------------------------------------------------------------- */

(function(){
  const root = document.documentElement;
  const ptLight = document.querySelector('#ptLight');
  const dispMap = document.querySelector('#dispMap');
  const panels = Array.from(document.querySelectorAll('.liquid-glass'));
  const imageCast = Array.from(document.querySelectorAll('.shadow-caster'));
  const textCast = Array.from(document.querySelectorAll('.shadow-text'));
  const allCast = imageCast.concat(textCast);
  const lightEl = document.querySelector('.light-draggable');
  const glassElements = Array.from(document.querySelectorAll('.liquid-glass, .shadow-text'));
  
  // All illuminatable elements
  const illuminatableElements = Array.from(document.querySelectorAll(
    '.liquid-glass, .shadow-text, .extra-image, h1, p, strong, .floaters img, .side-image'
  ));

  // Light settings
  const LIGHT_RADIUS = parseFloat(getComputedStyle(root).getPropertyValue('--light-radius')) || 300;
  const LIGHT_FALLOFF = parseFloat(getComputedStyle(root).getPropertyValue('--light-falloff')) || 0.8;

  // Default light position
  function defaultLightCoords() {
    const leftPct = parseFloat(getComputedStyle(root).getPropertyValue('--light-left-percent')) || 18;
    const topPct = parseFloat(getComputedStyle(root).getPropertyValue('--light-top-percent')) || 14;
    return { 
      x: Math.round(window.innerWidth * leftPct / 100), 
      y: Math.round(window.innerHeight * topPct / 100), 
      z: 300 
    };
  }

  // Smooth animation state
  let target = defaultLightCoords();
  let anim = { x: target.x, y: target.y, z: target.z };
  const LERP = 0.15; // Smooth animation

  // Enhanced shadow parameters for dark mode
  const SHADOW_MAX_OFFSET = parseFloat(getComputedStyle(root).getPropertyValue('--shadow-max-offset')) || 32;
  const SHADOW_MAX_BLUR   = parseFloat(getComputedStyle(root).getPropertyValue('--shadow-max-blur'))   || 48;
  const SHADOW_MIN_BLUR   = parseFloat(getComputedStyle(root).getPropertyValue('--shadow-min-blur'))   || 6;
  const SHADOW_BASE_OPACITY = parseFloat(getComputedStyle(root).getPropertyValue('--shadow-base-opacity')) || 0.4;
  const SHADOW_STRENGTH = parseFloat(getComputedStyle(root).getPropertyValue('--shadow-strength')) || 1.5;

  // Update SVG lighting systems
  function updateSvgLight(x, y, z){
    if(ptLight){ 
      ptLight.setAttribute('x', Math.round(x)); 
      ptLight.setAttribute('y', Math.round(y)); 
      ptLight.setAttribute('z', z); 
    }
    
    if(dispMap){ 
      dispMap.setAttribute('scale', parseFloat(getComputedStyle(root).getPropertyValue('--disp-scale')) || 2.0); 
    }
  }

  // Light illumination effect
  function updateIllumination(light){
    illuminatableElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Distance from light to element center
      const dx = centerX - light.x;
      const dy = centerY - light.y;
      const distance = Math.hypot(dx, dy);
      
      // Calculate illumination intensity
      const intensity = Math.max(0, 1 - Math.pow(distance / LIGHT_RADIUS, LIGHT_FALLOFF));
      
      // Apply illumination
      if (intensity > 0.1) {
        el.classList.add('illuminated');
        // Vary the illumination based on distance
        if (intensity > 0.7) {
          el.style.filter = `brightness(${1 + intensity * 0.3}) contrast(${1 + intensity * 0.2})`;
        } else if (intensity > 0.3) {
          el.style.filter = `brightness(${0.8 + intensity * 0.4}) contrast(${0.9 + intensity * 0.3})`;
        } else {
          el.style.filter = `brightness(${0.5 + intensity * 0.5}) contrast(${0.8 + intensity * 0.4})`;
        }
      } else {
        el.classList.remove('illuminated');
        el.style.filter = '';
      }
    });
  }

  // Enhanced shadow calculation for dark mode
  function applyShadowForElement(el, light){
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width/2;
    const cy = r.top + r.height/2;

    const dx = cx - light.x;
    const dy = cy - light.y;
    const dist = Math.hypot(dx, dy);

    const nx = dist ? dx / dist : 0;
    const ny = dist ? dy / dist : 0;

    // Enhanced falloff for dark mode
    const maxDist = Math.hypot(window.innerWidth, window.innerHeight);
    const strength = Math.max(0.2, Math.pow(1 - Math.min(dist / (maxDist * 0.7), 1), 0.9));

    let offsetScale = SHADOW_MAX_OFFSET * strength * SHADOW_STRENGTH;
    const insideGlass = !!el.closest('.liquid-glass');
    
    if (insideGlass) {
      offsetScale *= 0.8;
    }

    const sx = nx * offsetScale;
    const sy = ny * offsetScale;

    let blur = Math.max(SHADOW_MIN_BLUR, SHADOW_MIN_BLUR + (SHADOW_MAX_BLUR - SHADOW_MIN_BLUR) * strength);
    let opacity = Math.min(0.8, SHADOW_BASE_OPACITY + 0.6 * strength * SHADOW_STRENGTH);
    
    if (insideGlass) { 
      blur *= 1.3; 
      opacity *= 0.9; 
    }

    const vBias = 0.9;
    const bx = Math.round(sx);
    const by = Math.round(sy * vBias);

    // Enhanced shadows for dark mode
    if (el.classList.contains('shadow-caster') || el.tagName === 'IMG') {
      const shadowLayers = [
        `${bx}px ${by}px ${Math.round(blur)}px rgba(0,0,0,${opacity.toFixed(3)})`,
        `${Math.round(bx * 0.6)}px ${Math.round(by * 0.6)}px ${Math.round(blur * 0.7)}px rgba(0,0,0,${(opacity * 0.7).toFixed(3)})`,
        `${Math.round(bx * 1.8)}px ${Math.round(by * 1.8)}px ${Math.round(blur * 1.8)}px rgba(0,0,0,${(opacity * 0.4).toFixed(3)})`
      ];
      el.style.boxShadow = shadowLayers.join(', ');
    }

    // Enhanced text shadows for dark mode
    if (el.classList.contains('shadow-text') || el.tagName.match(/^H|P|STRONG$/)) {
      const tx = Math.round(sx * 0.6);
      const ty = Math.round(sy * 0.6);
      const tBlur1 = Math.max(3, Math.round(blur * 0.4));
      const tBlur2 = Math.max(8, Math.round(blur * 0.8));
      const tBlur3 = Math.max(15, Math.round(blur * 1.2));
      
      const o1 = (opacity * 1.1).toFixed(3);
      const o2 = (opacity * 0.7).toFixed(3);
      const o3 = (opacity * 0.3).toFixed(3);
      
      const shadowLayers = [
        `${tx}px ${ty}px ${tBlur1}px rgba(0,0,0,${o1})`,
        `${Math.round(tx * 1.7)}px ${Math.round(ty * 1.7)}px ${tBlur2}px rgba(0,0,0,${o2})`,
        `${Math.round(tx * 2.5)}px ${Math.round(ty * 2.5)}px ${tBlur3}px rgba(0,0,0,${o3})`
      ];
      
      el.style.textShadow = shadowLayers.join(', ');
    }

    // Enhanced depth transform
    const depthScale = 1 + 0.012 * strength;
    el.style.transform = `scale(${depthScale.toFixed(4)})`;
  }

  // Check if light is over glass
  function updateLightRefraction(light){
    let overGlass = false;
    
    glassElements.forEach(el => {
      const r = el.getBoundingClientRect();
      const isOver = light.x >= r.left && light.x <= r.right && 
                     light.y >= r.top && light.y <= r.bottom;
      if(isOver) overGlass = true;
    });
    
    if(lightEl){
      if(overGlass && !lightEl.classList.contains('over-glass')){
        lightEl.classList.add('over-glass');
      } else if(!overGlass && lightEl.classList.contains('over-glass')){
        lightEl.classList.remove('over-glass');
      }
    }
  }

  // Enhanced panel highlights for dark mode
  function updatePanelHighlights(light){
    panels.forEach(panel => {
      const r = panel.getBoundingClientRect();
      const px = ((light.x - r.left) / r.width) * 100;
      const py = ((light.y - r.top) / r.height) * 100;
      
      const clamp = (v,min,max) => Math.max(min, Math.min(max, v));
      const hlx = clamp(px, -20, 120);
      const hly = clamp(py, -20, 120);
      
      const dx = (r.left + r.width/2) - light.x;
      const dy = (r.top + r.height/2) - light.y;
      const dist = Math.hypot(dx,dy);
      const maxDist = Math.hypot(window.innerWidth, window.innerHeight);
      
      // Enhanced intensity for dark mode
      const intensity = Math.max(0.02, 0.6 * Math.pow(Math.max(0, 1 - dist / maxDist), 1.5));
      
      panel.style.setProperty('--hlx', hlx.toFixed(2) + '%');
      panel.style.setProperty('--hly', hly.toFixed(2) + '%');
      panel.style.setProperty('--hl-intensity', intensity.toFixed(3));
    });
  }

  // Animation loop with illumination
  let ticking = false;
  function tick(){
    anim.x += (target.x - anim.x) * LERP;
    anim.y += (target.y - anim.y) * LERP;
    
    updateSvgLight(anim.x, anim.y, anim.z || 300);
    updateLightRefraction(anim);
    updateIllumination(anim);
    allCast.forEach(el => applyShadowForElement(el, anim));
    updatePanelHighlights(anim);
    
    if(lightEl){
      lightEl.style.left = Math.round(anim.x) + 'px';
      lightEl.style.top  = Math.round(anim.y) + 'px';
    }
    ticking = false;
  }
  
  function scheduleTick(){ 
    if(!ticking){ 
      ticking = true; 
      requestAnimationFrame(tick); 
    } 
  }

  // Initialize
  const d = defaultLightCoords();
  target = { x:d.x, y:d.y, z:d.z };
  anim = { x:d.x, y:d.y, z:d.z };
  if(lightEl){ 
    lightEl.style.left = anim.x + 'px'; 
    lightEl.style.top = anim.y + 'px'; 
  }
  updateSvgLight(anim.x, anim.y, anim.z);
  updateLightRefraction(anim);
  updateIllumination(anim);
  allCast.forEach(el => applyShadowForElement(el, anim));
  updatePanelHighlights(anim);

  /* ---------- Enhanced drag handling ---------- */
  let dragging = false; 
  let pointerId = null; 
  let offset = {x:0,y:0};

  if (lightEl) {
    lightEl.addEventListener('pointerdown', (ev) => {
      if (ev.button && ev.button !== 0) return;
      dragging = true; 
      pointerId = ev.pointerId;
      lightEl.setPointerCapture(pointerId);
      const rect = lightEl.getBoundingClientRect();
      offset.x = ev.clientX - (rect.left + rect.width/2);
      offset.y = ev.clientY - (rect.top + rect.height/2);
      lightEl.style.transition = 'none';
    });

    lightEl.addEventListener('pointermove', (ev) => {
      if (!dragging || ev.pointerId !== pointerId) return;
      target.x = ev.clientX - offset.x;
      target.y = ev.clientY - offset.y;
      scheduleTick();
    });

    lightEl.addEventListener('pointerup', (ev) => {
      if (ev.pointerId !== pointerId) return;
      dragging = false;
      try { lightEl.releasePointerCapture(pointerId); } catch(e){}
      pointerId = null;
      lightEl.style.transition = '';
      target.x = Math.min(Math.max(10, target.x), window.innerWidth - 10);
      target.y = Math.min(Math.max(10, target.y), window.innerHeight - 10);
      scheduleTick();
    });

    lightEl.addEventListener('pointercancel', () => { 
      dragging = false; 
      pointerId = null; 
      lightEl.style.transition = ''; 
    });

    // Enhanced keyboard navigation
    lightEl.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 80 : 25;
      switch(e.key) {
        case 'ArrowLeft':  target.x = Math.max(0, target.x - step); break;
        case 'ArrowRight': target.x = Math.min(window.innerWidth, target.x + step); break;
        case 'ArrowUp':    target.y = Math.max(0, target.y - step); break;
        case 'ArrowDown':  target.y = Math.min(window.innerHeight, target.y + step); break;
        default: return;
      }
      e.preventDefault();
      scheduleTick();
    });
  }

  // Event handlers
  window.addEventListener('scroll', scheduleTick, { passive:true });
  window.addEventListener('resize', () => { 
    const d = defaultLightCoords();
    target = { x:d.x, y:d.y, z:d.z };
    scheduleTick(); 
  });

  // Watch for DOM changes
  const mo = new MutationObserver(scheduleTick);
  mo.observe(document.body, { subtree:true, childList:true, attributes:true });

})();