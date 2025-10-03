import containerQueries from '@tailwindcss/container-queries';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/** ===== Local pengganti @gitbook/colors ===== */
export enum ColorCategory {
  backgrounds = 'backgrounds',
  components = 'components',
  accents = 'accents',
  borders = 'borders',
  text = 'text',
}

export const shades = [50,100,200,300,400,500,600,700,800,900];
export const opacities = [0,4,8,12,16,24,40,64,72,88,96,100];
export const semanticColors = ['info','warning','danger','success'] as const;

function hexToRgb(hex: string): string {
  const s = hex.replace('#','');
  const r = parseInt(s.slice(0,2),16);
  const g = parseInt(s.slice(2,4),16);
  const b = parseInt(s.slice(4,6),16);
  return `${r} ${g} ${b}`;
}

function clamp(n:number,min=0,max=255){ return Math.min(max, Math.max(min,n)); }
function mix(c:[number,number,number], w:number):[number,number,number]{
  if (w>=0) return [clamp(c[0]+(255-c[0])*w), clamp(c[1]+(255-c[1])*w), clamp(c[2]+(255-c[2])*w)] as [number,number,number];
  const k=1+w; return [clamp(c[0]*k),clamp(c[1]*k),clamp(c[2]*k)] as [number,number,number];
}
function toHex([r,g,b]:[number,number,number]){
  const h=(n:number)=>Math.round(n).toString(16).padStart(2,'0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
function shadesOfColor(baseHex:string): Record<string,string>{
  const [r,g,b]=hexToRgb(baseHex).split(' ').map(n=>parseInt(n,10)) as [number,number,number];
  const curve = {50:0.9,100:0.8,200:0.6,300:0.4,400:0.2,500:0,600:-0.1,700:-0.2,800:-0.3,900:-0.4} as const;
  const out: Record<string,string> = {};
  for (const s of shades){
    const w = (curve as Record<number, number>)[s] ?? 0; // <- fix TS
    out[String(s)] = toHex(mix([r,g,b], w));
  }
  return out;
}

const indexKeys = Array.from({length:13},(_,i)=>String(i)); // "0".."12"
function generateVarShades(varName: string, filter: ColorCategory[] = []) {
  const result: Record<string, string> = {};
  // 50..900 selalu ada
  for (const s of shades){ result[String(s)] = `rgb(var(--${varName}-${s}))`; }
  // tambahin 0..12 kalau tanpa filter
  if (filter.length === 0){
    for (const idx of indexKeys){ result[idx] = `rgb(var(--${varName}-${idx}))`; }
  }
  // penting: sediakan key "base" (supaya class ...-tint-base valid)
  result.base = `rgb(var(--${varName}-base))`;
  result.subtle = `rgb(var(--${varName}-subtle))`;
  result.muted = `rgb(var(--${varName}-muted))`;
  result.strong = `rgb(var(--${varName}-strong))`;   // <-- tambah INI
  result.bold = `rgb(var(--${varName}-bold))`;       // biarin juga
  
  return result;
}

function generateShades(color: string) {
  const raw = shadesOfColor(color) as Record<string, string | undefined>;
  const map: Record<string, string> = {};

  for (const s of shades) {
    const hex = raw[String(s)] ?? raw['500'] ?? '#808080';
    map[String(s)] = `rgb(${hexToRgb(hex)} / <alpha-value>)`;
  }

  // ⬇️ gunakan bracket notation + fallback agar selalu string
  map['DEFAULT'] = map['500'] ?? '#808080';

  return map;
}



function opacity(){
  return opacities.reduce((acc, o, i)=>{ acc[i]=`${o/100}`; return acc; }, {} as Record<string,string>);
}

/** ===== Tailwind config ===== */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx,css}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx,css}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  theme: {
    extend: {
      aria: { 'current-page': 'current="page"' },
      fontFamily: {
        sans: ['var(--font-content)'],
        mono: ['var(--font-mono)'],
        emoji: ['Apple Color Emoji','Noto Color Emoji','var(--font-noto-color-emoji)','sans-serif'],
        var: ['var(--font-family)'],
      },
      fontSize: { xxs: ['0.625rem', { lineHeight: '0.75rem' }] },
      colors: {
        primary: generateVarShades('primary'),
        'contrast-primary': generateVarShades('contrast-primary'),
        tint: generateVarShades('tint'),
        'contrast-tint': generateVarShades('contrast-tint'),
        neutral: generateVarShades('neutral'),
        'contrast-neutral': generateVarShades('contrast-neutral'),
        'header-background': 'rgb(var(--header-background))',
        'header-link': 'rgb(var(--header-link))',
        ...Object.fromEntries(semanticColors.map(c => [c, generateVarShades(c)])),
        ...Object.fromEntries(semanticColors.map(c => [`contrast-${c}`, generateVarShades(`contrast-${c}`)])),
        yellow: generateShades('#f4e28d'),
        teal: generateShades('#3f89a1'),
        pomegranate: generateShades('#f25b3a'),
        periwinkle: generateShades('#acc6ee'),
      },
      backgroundColor: {
        'mark-blue': '#89C6DA4D',
        'mark-purple': '#DAD4FF4D',
        'mark-orange': '#FFDCBC4D',
        'mark-red': '#FFCCCB4D',
        'mark-yellow': '#FFF0854D',
        'mark-green': '#91EABF4D',
        primary: generateVarShades('primary', [ColorCategory.backgrounds, ColorCategory.components, ColorCategory.accents]),
        tint: generateVarShades('tint', [ColorCategory.backgrounds, ColorCategory.components, ColorCategory.accents]),
        neutral: generateVarShades('neutral', [ColorCategory.backgrounds, ColorCategory.components, ColorCategory.accents]),
        ...Object.fromEntries(semanticColors.map(c => [c, generateVarShades(c, [ColorCategory.backgrounds, ColorCategory.components, ColorCategory.accents])])),
      },
      gradientColorStops: {
        primary: generateVarShades('primary', [ColorCategory.backgrounds, ColorCategory.components, ColorCategory.accents]),
        tint: generateVarShades('tint', [ColorCategory.backgrounds, ColorCategory.components, ColorCategory.accents]),
        neutral: generateVarShades('neutral', [ColorCategory.backgrounds, ColorCategory.components, ColorCategory.accents]),
        ...Object.fromEntries(semanticColors.map(c => [c, generateVarShades(c, [ColorCategory.backgrounds, ColorCategory.components, ColorCategory.accents])])),
      },
      borderColor: {
        primary: generateVarShades('primary', [ColorCategory.borders, ColorCategory.accents]),
        tint: generateVarShades('tint', [ColorCategory.borders, ColorCategory.accents]),
        neutral: generateVarShades('neutral', [ColorCategory.borders, ColorCategory.accents]),
        ...Object.fromEntries(semanticColors.map(c => [c, generateVarShades(c, [ColorCategory.borders, ColorCategory.accents])])),
      },
      ringColor: {
        primary: generateVarShades('primary', [ColorCategory.borders]),
        tint: generateVarShades('tint', [ColorCategory.borders]),
        neutral: generateVarShades('neutral', [ColorCategory.borders]),
        ...Object.fromEntries(semanticColors.map(c => [c, generateVarShades(c, [ColorCategory.borders])])),
      },
      outlineColor: {
        primary: generateVarShades('primary', [ColorCategory.borders]),
        tint: generateVarShades('tint', [ColorCategory.borders]),
        neutral: generateVarShades('neutral', [ColorCategory.borders]),
        ...Object.fromEntries(semanticColors.map(c => [c, generateVarShades(c, [ColorCategory.borders])])),
      },
      boxShadowColor: {
        primary: generateVarShades('primary', [ColorCategory.borders]),
        tint: generateVarShades('tint', [ColorCategory.borders]),
        neutral: generateVarShades('neutral', [ColorCategory.borders]),
        ...Object.fromEntries(semanticColors.map(c => [c, generateVarShades(c, [ColorCategory.borders])])),
      },
      textColor: {
        primary: generateVarShades('primary', [ColorCategory.text]),
        'contrast-primary': generateVarShades('contrast-primary', [ColorCategory.backgrounds, ColorCategory.accents]),
        tint: generateVarShades('tint', [ColorCategory.text]),
        'contrast-tint': generateVarShades('contrast-tint', [ColorCategory.backgrounds, ColorCategory.accents]),
        neutral: generateVarShades('neutral', [ColorCategory.text]),
        'contrast-neutral': generateVarShades('contrast-neutral', [ColorCategory.backgrounds, ColorCategory.accents]),
        ...Object.fromEntries(semanticColors.flatMap(c => [
          [c, generateVarShades(c, [ColorCategory.text])],
          [`contrast-${c}`, generateVarShades(`contrast-${c}`, [ColorCategory.backgrounds, ColorCategory.accents])],
        ])),
      },
      textDecorationColor: {
        primary: generateVarShades('primary', [ColorCategory.text]),
        'contrast-primary': generateVarShades('contrast-primary', [ColorCategory.backgrounds, ColorCategory.accents]),
        tint: generateVarShades('tint', [ColorCategory.text]),
        'contrast-tint': generateVarShades('contrast-tint', [ColorCategory.backgrounds, ColorCategory.accents]),
        neutral: generateVarShades('neutral', [ColorCategory.text]),
        'contrast-neutral': generateVarShades('contrast-neutral', [ColorCategory.backgrounds, ColorCategory.accents]),
        ...Object.fromEntries(semanticColors.flatMap(c => [
          [c, generateVarShades(c, [ColorCategory.text])],
          [`contrast-${c}`, generateVarShades(`contrast-${c}`, [ColorCategory.backgrounds, ColorCategory.accents])],
        ])),
      },
      divideColor: {
        primary: generateVarShades('primary', [ColorCategory.borders]),
        tint: generateVarShades('tint', [ColorCategory.borders]),
        neutral: generateVarShades('neutral', [ColorCategory.borders]),
        ...Object.fromEntries(semanticColors.map(c => [c, generateVarShades(c, [ColorCategory.borders])])),
      },
      transitionTimingFunction: { quint: 'cubic-bezier(0.83, 0, 0.17, 1)' },
      animation: {
        present: 'present 200ms cubic-bezier(0.25, 1, 0.5, 1) both',
        'present-slow': 'present 500ms cubic-bezier(0.25, 1, 0.5, 1) both',
        scaleIn: 'scaleIn 200ms ease both',
        'scaleIn-slow': 'scaleIn 500ms ease both',
        scaleOut: 'scaleOut 200ms ease both',
        'scaleOut-slow': 'scaleOut 500ms ease both',
        fadeIn: 'fadeIn 200ms ease both',
        'fadeIn-slow': 'fadeIn 500ms ease both',
        fadeOut: 'fadeOut 200ms ease both',
        'fadeOut-slow': 'fadeOut 500ms ease both',
        appear: 'appear 200ms ease both allow-discrete',
        enterFromLeft: 'enterFromLeft 250ms cubic-bezier(0.83,0,0.17,1) both',
        enterFromRight: 'enterFromRight 250ms cubic-bezier(0.83,0,0.17,1) both',
        exitToLeft: 'exitToLeft 250ms cubic-bezier(0.83,0,0.17,1) both',
        exitToRight: 'exitToRight 250ms cubic-bezier(0.83,0,0.17,1) both',
        heightIn: 'heightIn 200ms ease both',
        crawl: 'crawl 2s ease-in-out infinite',
      },
      keyframes: {
        bounceSmall: {'0%,100%':{transform:'translateY(-15%)',animationTimingFunction:'cubic-bezier(0.8,0,1,1)'},
          '50%':{transform:'none',animationTimingFunction:'cubic-bezier(0,0,0.2,1)'}},
        pulseAlt:{'0%':{transform:'scale(0.01)',opacity:'0'},'70%':{opacity:'1'},'100%':{transform:'scale(2.8)',opacity:'0'}},
        fadeIn:{'0%':{opacity:'0'},'100%':{opacity:'1'}},
        present:{from:{opacity:'0',transform:'translateY(1rem) scale(90%)'},to:{opacity:'1',transform:'translateY(0) scale(1)'}},
        rotateLoop:{'0%':{transform:'rotate(0deg) scaleY(2.5) scaleX(2.5)'},'100%':{transform:'rotate(360deg) scaleY(2.5) scaleX(2.5)'}},
        pingAlt:{'0%':{transform:'scale(0.1)',opacity:'0'},'20%':{opacity:'1'},'30%,100%':{transform:'scale(5)',opacity:'0'}},
        wag:{'0%,40%':{transform:'rotate(0deg)'},'45%':{transform:'rotate(-10deg)'},'55%':{transform:'rotate(10deg)'},'60%,100%':{transform:'rotate(0deg)'}},
        pathLoading:{'0%,10%':{strokeDasharray:'100 100',strokeDashoffset:'0',opacity:'1'},'50%':{strokeDasharray:'100 100',strokeDashoffset:'-100',opacity:'0'},'51%':{strokeDasharray:'0 100',strokeDashoffset:'0',opacity:'0'},'90%,100%':{strokeDasharray:'100 100',strokeDashoffset:'0',opacity:'1'}},
        pathEnter:{'0%':{strokeDasharray:'0 100',strokeDashoffset:'0',opacity:'0'},'100%':{strokeDasharray:'100 100',strokeDashoffset:'0'}},
        stroke:{'0%':{strokeDasharray:'0 100',strokeDashoffset:'0',opacity:'0'},'20%,80%':{strokeDasharray:'100 100',strokeDashoffset:'0',opacity:'1'},'100%':{strokeDasharray:'100 100',strokeDashoffset:'-100',opacity:'0'}},
        bob:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-10%)'}},
        enterFromRight:{from:{opacity:'0',transform:'translateX(50%)',display:'none'},to:{opacity:'1',transform:'translateX(0)',display:'block'}},
        enterFromLeft:{from:{opacity:'0',transform:'translateX(-50%)',display:'none'},to:{opacity:'1',transform:'translateX(0)',display:'block'}},
        exitToRight:{from:{opacity:'1',transform:'translateX(0)',display:'block'},to:{opacity:'0',transform:'translateX(50%)',display:'none'}},
        exitToLeft:{from:{opacity:'1',transform:'translateX(0)',display:'block'},to:{opacity:'0',transform:'translateX(-10deg) scale(0.95)'}},
        scaleIn:{from:{opacity:'0',transform:'rotateX(-10deg) scale(0.9)'},to:{opacity:'1',transform:'rotateX(0deg) scale(1)'}},
        scaleOut:{from:{opacity:'1',transform:'rotateX(0deg) scale(1)'},to:{opacity:'0',transform:'rotateX(-10deg) scale(0.95)'}},
        fadeOut:{from:{opacity:'1'},to:{opacity:'0'}},
        heightIn:{from:{height:'0'},to:{height:'max-content'}},
        crawl:{'0%':{scale:'0 1',translate:'0 0'},'40%':{scale:'1 1',translate:'100% 0'},'100%':{scale:'0 1',translate:'100% 0'}},
      },
      boxShadow: {
        thinbottom:'0px 1px 0px rgba(0,0,0,0.05)',
        thintop:'0px -1px 0px rgba(0,0,0,0.05)',
        '1xs':'0px 1px 1px rgba(0,0,0,0.09), 0px 3.267px 2.754px rgba(0,0,0,0.05), 0px 6.278px 6.63px rgba(0,0,0,0.05), 0px 14px 22px rgba(0,0,0,0.04)',
      },
      scale: { '98':'0.98','102':'1.02','104':'1.04' },
    },
    opacity: opacity(),
    screens: { xs:'480px', sm:'640px', md:'768px', lg:'1024px', xl:'1280px', '2xl':'1536px', '3xl':'1920px' },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.no-scrollbar': {
          'scrollbar-width':'none',
          '-ms-overflow-style':'none',
          '&::-webkit-scrollbar':{ display:'none' },
        },
      });
    }),
    plugin(({ addVariant }) => {
      addVariant('navigation-open','body.navigation-open &');
      addVariant('chat-open','body:has(.ai-chat) &');
      addVariant('site-header-none','body:not(:has(#site-header:not(.mobile-only))) &');
      addVariant('site-header','body:has(#site-header:not(.mobile-only)) &');
      addVariant('site-header-sections',['body:has(#site-header:not(.mobile-only) #sections) &']);
      const custom = {
        sidebar:['sidebar-default','sidebar-filled'],
        list:['sidebar-list-default','sidebar-list-pill','sidebar-list-line'],
        tint:['tint','no-tint'],
        theme:['theme-clean','theme-muted','theme-bold','theme-gradient'],
        corner:['straight-corners','rounded-corners','circular-corners'],
        depth:['depth-flat','depth-subtle'],
        links:['links-default','links-accent'],
      } as const;
      for (const [category, variants] of Object.entries(custom)){
        for (const v of variants){
          addVariant(v, `html.${v} &`);
          if (category==='tint'){
            for (const t of custom.theme){
              addVariant(`${t}-${v}`, `html.${v}.${t} &`);
            }
          }
        }
      }
      addVariant('site-width-wide','body:has(.site-width-wide) &');
      addVariant('site-width-default','body:has(.site-width-default) &');
      addVariant('page-width-wide','body:has(.page-width-wide) &');
      addVariant('page-no-toc','body:has(.page-no-toc) &');
      addVariant('page-has-toc','body:has(.page-has-toc) &');
      addVariant('page-api-block','body:has(.openapi-block) &');
      addVariant('print-mode','body:has(.print-mode) &');
    }),
    plugin(({ matchUtilities }) => {
      matchUtilities({ perspective: (v)=>({perspective:v}) });
    }),
    containerQueries,
    typography,
  ],
};

export default config;
