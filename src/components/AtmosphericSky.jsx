import React, { useEffect, useRef } from 'react';

/**
 * AtmosphericSky - Lightweight 60fps Procedural Weather & Sky Engine
 * Supports: Auto Time-of-Day, Starry Night, Gentle Rain, Thunderstorm, Winter Snowfall,
 * Flying Birds flock, and Silhouette Forest Trees along rolling hills.
 */
export function AtmosphericSky({ enabled = true, weather = 'auto' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled || weather === 'off') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initScene();
    };
    window.addEventListener('resize', handleResize);

    // Determine current effective atmosphere
    const hour = new Date().getHours();
    let effectiveTheme = weather;
    if (weather === 'auto') {
      if (hour >= 5 && hour < 8) effectiveTheme = 'dawn';
      else if (hour >= 8 && hour < 17) effectiveTheme = 'day';
      else if (hour >= 17 && hour < 20) effectiveTheme = 'dusk';
      else effectiveTheme = 'stars';
    }

    let stars = [];
    let rainDrops = [];
    let snowflakes = [];
    let birds = [];
    let trees = [];
    let grassBlades = [];
    let lightning = { active: false, opacity: 0, timer: 0, nextStrike: 180 + Math.random() * 240 };

    const getHillY = (x, h) => {
      return h - 38 + Math.sin(x * 0.003 + 1.2) * 14 + Math.sin(x * 0.007) * 7;
    };

    const initScene = () => {
      // 1. Uniformly Scattered Starfield
      stars = [];
      const starCount = effectiveTheme === 'stars' || effectiveTheme === 'dawn' || effectiveTheme === 'dusk' ? 120 : 40;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.85),
          radius: Math.random() * 1.5 + 0.4,
          baseAlpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2,
          driftX: (Math.random() - 0.5) * 0.12,
          driftY: (Math.random() - 0.5) * 0.08
        });
      }

      // 2. Rain Droplets
      rainDrops = [];
      const rainCount = effectiveTheme === 'thunder' ? 160 : (effectiveTheme === 'rain' ? 100 : 0);
      for (let i = 0; i < rainCount; i++) {
        rainDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 18 + 12,
          speed: Math.random() * 8 + 14,
          alpha: Math.random() * 0.4 + 0.2
        });
      }

      // 3. Snowflakes
      snowflakes = [];
      const snowCount = effectiveTheme === 'snow' ? 90 : 0;
      for (let i = 0; i < snowCount; i++) {
        snowflakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.2 + 1,
          speed: Math.random() * 1.2 + 0.8,
          drift: Math.random() * 0.8 - 0.4,
          phase: Math.random() * Math.PI * 2
        });
      }

      // 4. Soaring Birds
      birds = [];
      const birdCount = 6;
      for (let i = 0; i < birdCount; i++) {
        birds.push({
          x: (width / birdCount) * i + Math.random() * 120,
          y: height * 0.18 + Math.random() * (height * 0.35),
          speed: 1.2 + Math.random() * 0.9,
          wingSpan: 10 + Math.random() * 6,
          flapSpeed: 0.12 + Math.random() * 0.06,
          phase: Math.random() * Math.PI * 2,
          bobRange: 1.8 + Math.random() * 2.2
        });
      }

      // 5. Procedural Silhouette Trees along the Horizon
      trees = [];
      const treeSpacing = 75;
      const treeCount = Math.ceil(width / treeSpacing) + 2;
      for (let i = 0; i < treeCount; i++) {
        const treeX = i * treeSpacing + (Math.random() - 0.5) * 30;
        const treeType = Math.random() > 0.4 ? 'pine' : 'deciduous';
        trees.push({
          x: treeX,
          height: 38 + Math.random() * 32,
          type: treeType,
          swayPhase: Math.random() * Math.PI * 2,
          layers: 3 + Math.floor(Math.random() * 2)
        });
      }

      // 6. Grass Blade Geometry
      grassBlades = [];
      const bladeSpacing = 12;
      const totalBlades = Math.ceil(width / bladeSpacing) + 4;
      for (let i = 0; i < totalBlades; i++) {
        grassBlades.push({
          x: i * bladeSpacing,
          height: 40 + Math.sin(i * 0.3) * 16 + Math.random() * 12,
          lean: (Math.random() - 0.5) * 10,
          phase: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.015
        });
      }
    };

    initScene();

    let time = 0;

    const render = () => {
      time += 0.02;

      // 1. Sky Gradient based on Theme
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (effectiveTheme === 'dawn') {
        skyGrad.addColorStop(0, '#151329');
        skyGrad.addColorStop(0.55, '#2e1936');
        skyGrad.addColorStop(0.85, '#5c2a38');
        skyGrad.addColorStop(1, '#a34842');
      } else if (effectiveTheme === 'day') {
        skyGrad.addColorStop(0, '#0c1220');
        skyGrad.addColorStop(0.6, '#151f33');
        skyGrad.addColorStop(1, '#202f4a');
      } else if (effectiveTheme === 'dusk') {
        skyGrad.addColorStop(0, '#120d24');
        skyGrad.addColorStop(0.5, '#2e1534');
        skyGrad.addColorStop(0.8, '#592036');
        skyGrad.addColorStop(1, '#8f3333');
      } else if (effectiveTheme === 'thunder') {
        skyGrad.addColorStop(0, '#07080f');
        skyGrad.addColorStop(0.65, '#0e111a');
        skyGrad.addColorStop(1, '#181b26');
      } else if (effectiveTheme === 'rain') {
        skyGrad.addColorStop(0, '#0a0d17');
        skyGrad.addColorStop(0.6, '#121724');
        skyGrad.addColorStop(1, '#1b2234');
      } else if (effectiveTheme === 'snow') {
        skyGrad.addColorStop(0, '#0e121d');
        skyGrad.addColorStop(0.6, '#182030');
        skyGrad.addColorStop(1, '#253044');
      } else {
        // Starry Night
        skyGrad.addColorStop(0, '#080a14');
        skyGrad.addColorStop(0.6, '#0d1021');
        skyGrad.addColorStop(1, '#161933');
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Lightning Flash Effect for Thunderstorm
      if (effectiveTheme === 'thunder') {
        lightning.timer++;
        if (lightning.timer >= lightning.nextStrike) {
          lightning.active = true;
          lightning.opacity = 0.45;
          lightning.timer = 0;
          lightning.nextStrike = 200 + Math.random() * 320;
        }

        if (lightning.active) {
          ctx.fillStyle = `rgba(220, 235, 255, ${lightning.opacity})`;
          ctx.fillRect(0, 0, width, height);
          lightning.opacity -= 0.035;
          if (lightning.opacity <= 0) {
            lightning.active = false;
          }
        }
      }

      // 3. Render Stars
      if (effectiveTheme !== 'rain' && effectiveTheme !== 'thunder') {
        for (let s of stars) {
          s.x += s.driftX;
          s.y += s.driftY;
          if (s.x < 0) s.x = width;
          if (s.x > width) s.x = 0;
          if (s.y < 0) s.y = height * 0.85;
          if (s.y > height * 0.85) s.y = 0;

          const twinkle = Math.sin(time * s.twinkleSpeed * 50 + s.phase);
          const currentAlpha = Math.max(0.1, Math.min(1.0, s.baseAlpha + twinkle * 0.3));

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 246, 255, ${currentAlpha})`;
          ctx.fill();
        }
      }

      // 4. Render Soaring Birds
      if (effectiveTheme !== 'thunder') {
        ctx.strokeStyle = 'rgba(10, 12, 22, 0.72)';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let b of birds) {
          b.x += b.speed;
          if (b.x > width + 40) {
            b.x = -40;
            b.y = height * 0.15 + Math.random() * (height * 0.38);
          }

          const curY = b.y + Math.sin(time * 1.5 + b.phase) * b.bobRange;
          const wingFlap = Math.sin(time * b.flapSpeed * 40 + b.phase);
          const wingHeight = wingFlap * (b.wingSpan * 0.45);

          ctx.beginPath();
          // Left Wing
          ctx.moveTo(b.x - b.wingSpan, curY - wingHeight);
          ctx.quadraticCurveTo(b.x - b.wingSpan * 0.4, curY + (wingHeight > 0 ? -2 : 2), b.x, curY);
          // Right Wing
          ctx.quadraticCurveTo(b.x + b.wingSpan * 0.4, curY + (wingHeight > 0 ? -2 : 2), b.x + b.wingSpan, curY - wingHeight);
          ctx.stroke();
        }
      }

      // 5. Render Rain Droplets
      if (effectiveTheme === 'rain' || effectiveTheme === 'thunder') {
        ctx.strokeStyle = 'rgba(180, 215, 255, 0.4)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let r of rainDrops) {
          r.y += r.speed;
          r.x -= 3;
          if (r.y > height) {
            r.y = -20;
            r.x = Math.random() * width + 40;
          }
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - 4, r.y + r.length);
        }
        ctx.stroke();
      }

      // 6. Render Floating Snowflakes
      if (effectiveTheme === 'snow') {
        ctx.fillStyle = 'rgba(240, 246, 255, 0.8)';
        for (let sf of snowflakes) {
          sf.y += sf.speed;
          sf.x += Math.sin(time + sf.phase) * 0.8 + sf.drift;
          if (sf.y > height) {
            sf.y = -10;
            sf.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(sf.x, sf.y, sf.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. Render Procedural Horizon Silhouette Trees
      ctx.fillStyle = 'rgba(7, 9, 18, 0.92)';
      for (let t of trees) {
        const treeBaseY = getHillY(t.x, height) + 4;
        const treeSway = Math.sin(time * 0.8 + t.swayPhase) * 2;

        if (t.type === 'pine') {
          // Pine Tree: Tiered Triangles + Trunk
          const trunkW = 4;
          const trunkH = t.height * 0.25;
          ctx.fillRect(t.x - trunkW / 2, treeBaseY - trunkH, trunkW, trunkH);

          const tierH = (t.height - trunkH) / t.layers;
          for (let l = 0; l < t.layers; l++) {
            const bottomY = treeBaseY - trunkH - (l * tierH * 0.75);
            const topY = bottomY - tierH * 1.25;
            const halfW = (t.height * 0.32) * (1 - (l * 0.22));

            ctx.beginPath();
            ctx.moveTo(t.x - halfW, bottomY);
            ctx.lineTo(t.x + halfW, bottomY);
            ctx.lineTo(t.x + (treeSway * (l + 1) * 0.3), topY);
            ctx.closePath();
            ctx.fill();
          }
        } else {
          // Deciduous Tree: Trunk + Rounded Canopy
          const trunkW = 5;
          const trunkH = t.height * 0.4;
          ctx.fillRect(t.x - trunkW / 2, treeBaseY - trunkH, trunkW, trunkH);

          const canopyRadius = t.height * 0.42;
          const canopyY = treeBaseY - trunkH - canopyRadius * 0.6;
          ctx.beginPath();
          ctx.arc(t.x + treeSway, canopyY, canopyRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 8. Gentle Rolling Hill Silhouette
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 16) {
        ctx.lineTo(x, getHillY(x, height));
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(6, 8, 16, 0.98)';
      ctx.fill();

      // 9. Swaying Grass Blades in the Breeze
      ctx.strokeStyle = 'rgba(8, 10, 20, 0.99)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();

      const windPower = effectiveTheme === 'thunder' ? 2.8 : 1.5;
      const swayScale = effectiveTheme === 'thunder' ? 18 : 11;

      for (let blade of grassBlades) {
        const sway = Math.sin(time * windPower + blade.phase) * swayScale + blade.lean;
        const baseY = getHillY(blade.x, height) + 12;
        const tipX = blade.x + sway;
        const tipY = baseY - blade.height;

        ctx.moveTo(blade.x, baseY);
        ctx.quadraticCurveTo(blade.x + sway * 0.4, baseY - blade.height * 0.6, tipX, tipY);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, weather]);

  if (!enabled || weather === 'off') return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="atmospheric-sky-canvas"
    />
  );
}
