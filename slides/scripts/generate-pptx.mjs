import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PptxGenJS from 'pptxgenjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const slidesRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(slidesRoot, '..');
const outputsDir = path.resolve(repoRoot, 'python', 'outputs');
const distDir = path.resolve(slidesRoot, 'dist');

const pptOutputPath = path.resolve(distDir, 'Attention_Guided_Evolutionary_Art_Abdul_Ahad.pptx');

const NAME = 'Abdul Ahad';
const REG_NO = '245805010';

const COLORS = {
  ink: '1A1D29',
  muted: '4B556B',
  accent: 'E85D04',
  accentSoft: 'FFF0E6',
  line: 'D8DEE9',
  bg: 'F8FAFC',
  green: '2F9E44',
  red: 'C92A2A',
  blue: '1C7ED6',
};

const FONT = {
  heading: 'Aptos Display',
  body: 'Aptos',
  mono: 'Consolas',
};

function img(name) {
  const filePath = path.resolve(outputsDir, name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required image: ${filePath}`);
  }
  return filePath;
}

function loadStats() {
  const statsPath = path.resolve(outputsDir, 'run_stats.json');
  if (!fs.existsSync(statsPath)) {
    return {
      best_run: {
        target: 'heart',
        total_iterations: 5000,
        accepted_polygons: 0,
        final_mse: 0,
        runtime_seconds: 0,
      },
    };
  }
  return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
}

function addSlideFrame(slide, title, subtitle = '') {
  slide.background = { color: COLORS.bg };
  slide.addShape('rect', { x: 0, y: 0, w: 13.333, h: 0.42, fill: { color: COLORS.accent }, line: { color: COLORS.accent } });
  slide.addShape('rect', { x: 0, y: 7.1, w: 13.333, h: 0.4, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 0.5 } });

  slide.addText(title, {
    x: 0.5,
    y: 0.15,
    w: 10.5,
    h: 0.45,
    fontFace: FONT.heading,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 0.56,
      w: 10.8,
      h: 0.3,
      fontFace: FONT.body,
      fontSize: 12,
      color: COLORS.muted,
    });
  }

  slide.addText(`Name: ${NAME} | Reg. No.: ${REG_NO}`, {
    x: 0.5,
    y: 7.15,
    w: 8.5,
    h: 0.25,
    fontFace: FONT.body,
    fontSize: 10,
    color: COLORS.muted,
  });

  slide.addText('Home', {
    x: 12.15,
    y: 7.15,
    w: 0.7,
    h: 0.22,
    align: 'center',
    fontFace: FONT.body,
    fontSize: 9,
    color: COLORS.blue,
    hyperlink: { slide: 1 },
  });
}

function addBullets(slide, lines, opts) {
  const { x, y, w, h, fontSize = 18 } = opts;
  slide.addText(
    lines.map((line) => ({ text: line, options: { bullet: { indent: 16 } } })),
    {
      x,
      y,
      w,
      h,
      fontFace: FONT.body,
      fontSize,
      color: COLORS.ink,
      breakLine: true,
      paraSpaceAfterPt: 8,
      valign: 'top',
    }
  );
}

function addDeck(ppt, stats) {
  const best = stats.best_run;

  const s1 = ppt.addSlide();
  s1.background = { color: 'FFFFFF' };
  s1.addShape('rect', { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: 'FFF8F2' }, line: { color: 'FFF8F2' } });
  s1.addShape('roundRect', { x: 0.6, y: 1.15, w: 12.15, h: 5.2, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 } });
  s1.addText('Attention-Guided Evolutionary Art', {
    x: 1.0, y: 2.0, w: 10.8, h: 1.0,
    fontFace: FONT.heading, fontSize: 42, bold: true, color: COLORS.ink,
  });
  s1.addText('Teaching an AI to paint using math.', {
    x: 1.0, y: 3.1, w: 9.5, h: 0.5,
    fontFace: FONT.body, fontSize: 22, color: COLORS.muted,
  });
  s1.addText(`Name: ${NAME}\nReg. No.: ${REG_NO}`, {
    x: 1.0, y: 4.25, w: 4.2, h: 1.0,
    fontFace: FONT.body, fontSize: 16, color: COLORS.ink,
    breakLine: true,
  });
  s1.addShape('roundRect', {
    x: 10.0, y: 5.45, w: 2.3, h: 0.62,
    fill: { color: COLORS.accent }, line: { color: COLORS.accent },
  });
  s1.addText('Start', {
    x: 10.0, y: 5.58, w: 2.3, h: 0.3,
    align: 'center',
    fontFace: FONT.body, fontSize: 14, bold: true, color: 'FFFFFF',
    hyperlink: { slide: 2 },
  });

  const s2 = ppt.addSlide();
  addSlideFrame(s2, 'What does it do?', 'Simple intuition before formulas');
  s2.addText('An AI builds an image from scratch using only triangles, quadrilaterals, and ellipses, placed one at a time.', {
    x: 0.8, y: 1.25, w: 6.2, h: 1.2,
    fontFace: FONT.body, fontSize: 20, color: COLORS.ink,
    valign: 'top',
  });
  addBullets(s2, [
    'Starts with a blank white canvas.',
    'Adds one shape candidate at a time.',
    'Keeps only candidates that reduce error.',
  ], { x: 0.95, y: 2.7, w: 5.9, h: 2.4, fontSize: 17 });
  s2.addImage({ path: img('heart_final.jpg'), x: 7.0, y: 1.15, w: 5.8, h: 5.7 });

  const s3 = ppt.addSlide();
  addSlideFrame(s3, 'How does it know where to put shapes?', 'The Error Map');
  s3.addImage({ path: img('heart_error_map_mid.jpg'), x: 0.75, y: 1.2, w: 6.2, h: 5.6 });
  s3.addText('Bright areas = where the AI is doing worst.', {
    x: 7.25, y: 1.8, w: 5.5, h: 0.5, fontFace: FONT.body, fontSize: 20, color: COLORS.ink,
  });
  s3.addText('Each new shape is sampled inside high-error zones, so computation is focused where it matters most.', {
    x: 7.25, y: 2.45, w: 5.4, h: 1.3, fontFace: FONT.body, fontSize: 16, color: COLORS.muted,
  });
  s3.addText('MSE gives the pixel-by-pixel mismatch signal that powers this attention map.', {
    x: 7.25, y: 3.95, w: 5.4, h: 0.9, fontFace: FONT.body, fontSize: 16, color: COLORS.muted,
  });

  const s4 = ppt.addSlide();
  addSlideFrame(s4, 'The math: Mean Squared Error (MSE)', 'Core objective function');
  s4.addImage({ path: img('mse_formula.png'), x: 1.15, y: 1.35, w: 11.0, h: 1.4 });
  addBullets(s4, [
    'Compute this over all pixels and color channels.',
    'Higher local error appears brighter on the error map.',
    'Optimization goal: monotonically lower global MSE.',
  ], { x: 1.3, y: 3.0, w: 10.5, h: 2.7, fontSize: 18 });

  const s5 = ppt.addSlide();
  addSlideFrame(s5, 'Hill Climbing: Accept or Reject?', 'Greedy local search');
  s5.addShape('roundRect', { x: 0.8, y: 2.1, w: 2.6, h: 1.0, fill: { color: 'EEF2FF' }, line: { color: '4C6EF5', pt: 1.2 } });
  s5.addText('Try shape', { x: 0.8, y: 2.45, w: 2.6, h: 0.3, align: 'center', fontFace: FONT.body, fontSize: 16, bold: true, color: COLORS.ink });

  s5.addShape('diamond', { x: 4.25, y: 1.8, w: 2.9, h: 1.6, fill: { color: 'FFF4E6' }, line: { color: 'F08C00', pt: 1.2 } });
  s5.addText('MSE\nimproved?', { x: 4.65, y: 2.3, w: 2.1, h: 0.7, align: 'center', fontFace: FONT.body, fontSize: 14, bold: true, color: COLORS.ink, breakLine: true });

  s5.addShape('roundRect', { x: 8.5, y: 1.15, w: 3.5, h: 1.1, fill: { color: 'EAF7EC' }, line: { color: COLORS.green, pt: 1.2 } });
  s5.addText('Yes: Keep it', { x: 8.5, y: 1.55, w: 3.5, h: 0.3, align: 'center', fontFace: FONT.body, fontSize: 16, bold: true, color: COLORS.ink });

  s5.addShape('roundRect', { x: 8.5, y: 3.45, w: 3.5, h: 1.1, fill: { color: 'FFF1F0' }, line: { color: COLORS.red, pt: 1.2 } });
  s5.addText('No: Reject it', { x: 8.5, y: 3.85, w: 3.5, h: 0.3, align: 'center', fontFace: FONT.body, fontSize: 16, bold: true, color: COLORS.ink });

  s5.addShape('line', { x: 3.4, y: 2.6, w: 0.85, h: 0.0, line: { color: COLORS.muted, pt: 1.6 } });
  s5.addShape('line', { x: 7.12, y: 2.15, w: 1.4, h: -0.45, line: { color: COLORS.muted, pt: 1.6 } });
  s5.addShape('line', { x: 7.12, y: 2.95, w: 1.4, h: 0.85, line: { color: COLORS.muted, pt: 1.6 } });
  s5.addText('Yes', { x: 7.4, y: 1.6, w: 0.7, h: 0.2, fontFace: FONT.body, fontSize: 10, color: COLORS.green });
  s5.addText('No', { x: 7.4, y: 4.05, w: 0.7, h: 0.2, fontFace: FONT.body, fontSize: 10, color: COLORS.red });

  s5.addText('Thousands of candidates are tested quickly. Most are rejected. Surviving shapes are exactly those that improve image quality.', {
    x: 0.9, y: 5.5, w: 11.9, h: 0.9, fontFace: FONT.body, fontSize: 15, color: COLORS.muted,
  });

  const s6 = ppt.addSlide();
  addSlideFrame(s6, 'Three Phases of Evolution', 'Size scheduling from coarse to detail');
  const cardW = 4.0;
  const gap = 0.35;
  const y = 1.25;
  const h = 5.7;
  const x0 = 0.65;
  const phases = [
    { title: 'Phase 1: Coarse', img: 'heart_phase_coarse.jpg', text: 'Large polygons capture global color and silhouette.' },
    { title: 'Phase 2: Structural', img: 'heart_phase_structural.jpg', text: 'Medium polygons recover major edges and geometry.' },
    { title: 'Phase 3: Detail', img: 'heart_phase_detail.jpg', text: 'Small polygons refine local residual errors.' },
  ];
  phases.forEach((p, i) => {
    const x = x0 + i * (cardW + gap);
    s6.addShape('roundRect', { x, y, w: cardW, h, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1.0 } });
    s6.addText(p.title, { x: x + 0.18, y: y + 0.15, w: cardW - 0.36, h: 0.34, fontFace: FONT.body, fontSize: 15, bold: true, color: COLORS.ink });
    s6.addImage({ path: img(p.img), x: x + 0.18, y: y + 0.58, w: cardW - 0.36, h: 3.7 });
    s6.addText(p.text, { x: x + 0.18, y: y + 4.45, w: cardW - 0.36, h: 1.0, fontFace: FONT.body, fontSize: 12, color: COLORS.muted });
  });

  const s7 = ppt.addSlide();
  addSlideFrame(s7, 'Live Demo Still', 'Four-panel visualization during optimization');
  s7.addImage({ path: img('heart_live_panel.jpg'), x: 0.7, y: 1.0, w: 11.95, h: 5.95 });
  s7.addShape('rect', { x: 0.7, y: 6.5, w: 11.95, h: 0.38, fill: { color: '000000' }, line: { color: '000000' }, transparency: 20 });
  s7.addText('This is the AI thinking in real time.', {
    x: 0.9, y: 6.58, w: 11.4, h: 0.2, align: 'center', fontFace: FONT.body, fontSize: 13, color: 'FFFFFF',
  });

  const s8 = ppt.addSlide();
  addSlideFrame(s8, 'Three Targets, Three Results', 'Same algorithm, different visual trajectories');
  s8.addImage({ path: img('comparison_grid.jpg'), x: 0.85, y: 1.1, w: 11.65, h: 5.9 });
  s8.addText('The same optimization pipeline yields a unique arrangement of accepted shapes for each target and each run.', {
    x: 1.0, y: 6.85, w: 11.2, h: 0.3, fontFace: FONT.body, fontSize: 12, color: COLORS.muted, align: 'center',
  });

  const s9 = ppt.addSlide();
  addSlideFrame(s9, 'The Bigger Idea', 'Theory bridge to modern AI concepts');
  const bx = 0.8;
  const bw = 3.95;
  const by = 1.45;
  const bh = 2.05;
  s9.addShape('roundRect', { x: bx, y: by, w: bw, h: bh, fill: { color: 'E8F3FF' }, line: { color: COLORS.blue, pt: 1 } });
  s9.addText('Error map = attention', { x: bx + 0.2, y: by + 0.2, w: bw - 0.4, h: 0.3, fontFace: FONT.body, fontSize: 15, bold: true, color: COLORS.ink });
  s9.addText('Focuses compute where mismatch is highest.', { x: bx + 0.2, y: by + 0.62, w: bw - 0.4, h: 0.8, fontFace: FONT.body, fontSize: 12, color: COLORS.muted });

  s9.addShape('roundRect', { x: bx + 4.25, y: by, w: bw, h: bh, fill: { color: 'FFF4E6' }, line: { color: COLORS.accent, pt: 1 } });
  s9.addText('Size schedule = LR decay', { x: bx + 4.45, y: by + 0.2, w: bw - 0.4, h: 0.3, fontFace: FONT.body, fontSize: 15, bold: true, color: COLORS.ink });
  s9.addText('Large steps first, finer steps later.', { x: bx + 4.45, y: by + 0.62, w: bw - 0.4, h: 0.8, fontFace: FONT.body, fontSize: 12, color: COLORS.muted });

  s9.addShape('roundRect', { x: bx + 8.5, y: by, w: bw, h: bh, fill: { color: 'EAF7EC' }, line: { color: COLORS.green, pt: 1 } });
  s9.addText('Accept/reject = descent', { x: bx + 8.7, y: by + 0.2, w: bw - 0.4, h: 0.3, fontFace: FONT.body, fontSize: 15, bold: true, color: COLORS.ink });
  s9.addText('Greedy improvement without explicit gradients.', { x: bx + 8.7, y: by + 0.62, w: bw - 0.4, h: 0.8, fontFace: FONT.body, fontSize: 12, color: COLORS.muted });

  s9.addShape('line', { x: 2.75, y: 3.55, w: 3.0, h: 1.1, line: { color: COLORS.muted, pt: 1.4 } });
  s9.addShape('line', { x: 7.0, y: 3.55, w: 3.0, h: 1.1, line: { color: COLORS.muted, pt: 1.4 } });
  s9.addShape('roundRect', { x: 5.25, y: 4.8, w: 2.8, h: 1.2, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 } });
  s9.addText('Unified view:\noptimization-guided generative process', { x: 5.4, y: 5.05, w: 2.5, h: 0.8, fontFace: FONT.body, fontSize: 11, color: COLORS.ink, align: 'center', breakLine: true });

  const s10 = ppt.addSlide();
  addSlideFrame(s10, 'Summary', 'Final run statistics and closing');
  s10.addShape('roundRect', { x: 0.9, y: 1.4, w: 11.5, h: 4.6, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 } });

  const rows = [
    ['Best Target', String(best.target)],
    ['Total Iterations', String(best.total_iterations)],
    ['Polygons Accepted', String(best.accepted_polygons)],
    ['Final MSE', Number(best.final_mse).toFixed(6)],
    ['Runtime (seconds)', Number(best.runtime_seconds).toFixed(2)],
  ];

  let cy = 1.85;
  rows.forEach(([k, v]) => {
    s10.addText(k, { x: 1.3, y: cy, w: 4.0, h: 0.4, fontFace: FONT.body, fontSize: 15, bold: true, color: COLORS.muted });
    s10.addText(v, { x: 5.3, y: cy, w: 5.8, h: 0.4, fontFace: FONT.mono, fontSize: 18, color: COLORS.ink });
    cy += 0.75;
  });

  s10.addShape('roundRect', { x: 1.25, y: 6.25, w: 10.8, h: 0.9, fill: { color: COLORS.accentSoft }, line: { color: COLORS.accent, pt: 1 } });
  s10.addText('Every run is unique. Every accepted shape was chosen by math.', {
    x: 1.45,
    y: 6.5,
    w: 10.4,
    h: 0.35,
    align: 'center',
    fontFace: FONT.body,
    fontSize: 18,
    bold: true,
    color: COLORS.ink,
  });
}

async function main() {
  if (!fs.existsSync(outputsDir)) {
    throw new Error(`Outputs folder missing: ${outputsDir}. Run python demo first.`);
  }
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const stats = loadStats();

  const ppt = new PptxGenJS();
  ppt.layout = 'LAYOUT_WIDE';
  ppt.author = NAME;
  ppt.company = 'FAST NUCES';
  ppt.subject = 'Attention-Guided Evolutionary Art';
  ppt.title = 'Attention-Guided Evolutionary Art';
  ppt.theme = {
    headFontFace: FONT.heading,
    bodyFontFace: FONT.body,
    lang: 'en-US',
  };

  addDeck(ppt, stats);

  await ppt.writeFile({ fileName: pptOutputPath });
  console.log(`[pptx] generated: ${pptOutputPath}`);
}

main().catch((err) => {
  console.error('[pptx] generation failed:', err);
  process.exit(1);
});
