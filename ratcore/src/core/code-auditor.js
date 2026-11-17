// RatCore ToolGuard — Барьер 4: Статический аудитор кода игр/сцен (A-03, RC-107)
// Запрещает импорт внутренних модулей и ручную сборку вершинных/WebGL-буферов в обход RatCore.tools.*

const FORBIDDEN_RULES = [
  {
    id: 'internal-import',
    re: /from\s+['"][^'"]*ratcore\/src\/(?:core\/seal|assets\/mesh-builder|render\/)/gi,
    message: 'Прямой импорт внутренних модулей RatCore запрещён (используй только ratcore/ratcore.js и engine.tools.*)',
  },
  {
    id: 'raw-webgl-buffer',
    re: /\bgl\.(bufferData|createBuffer|drawArrays|drawElements)\s*\(/g,
    message: 'Прямые вызовы WebGL-буферов в обход RatCore.tools.build.* запрещены',
  },
  {
    id: 'raw-vertex-array',
    re: /\b(?:positions|vertices)\s*=\s*new\s+Float32Array\s*\(\s*\[/g,
    message: 'Ручная сборка вершинных массивов в коде игры запрещена — используй engine.tools.build.*',
  },
  {
    id: 'raw-three-geometry',
    re: /\bnew\s+THREE\.(?:BufferGeometry|BoxGeometry|SphereGeometry)\s*\(/g,
    message: 'Прямое создание геометрии Three.js внутри RatCore-сцены запрещено — экспортируй через tools.bridge.*',
  },
  {
    id: 'seal-forgery',
    re: /__kind\s*:\s*['"]RatCore(?:Mesh|Texture)Handle['"]|claimMintAuthority\s*\(/g,
    message: 'Попытка подделки печати ToolGuard или захвата mintAuthority',
  },
  {
    id: 'raw-canvas-texture',
    re: /document\.createElement\s*\(\s*['"]canvas['"]\s*\)\s*\.getContext\s*\(\s*['"]2d['"]\s*\)/g,
    message: 'Ручная отрисовка текстур через сырой 2D Canvas в обход engine.tools.build.texGenerate запрещена',
  },
];

export function auditSourceCode(sourceCode, filename = 'scene.js') {
  const code = String(sourceCode || '');
  const violations = [];
  for (const rule of FORBIDDEN_RULES) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(code))) {
      const line = code.slice(0, m.index).split('\n').length;
      violations.push({
        code: 'RC-107',
        rule: rule.id,
        file: filename,
        line,
        snippet: m[0],
        message: rule.message,
        autoFixHint: 'Замени ручную геометрию на вызов engine.tools.build.primitive / extrude / loft / lathe / voxels / fromRecipe.',
      });
    }
  }
  return {
    ok: violations.length === 0,
    code: violations.length === 0 ? null : 'RC-107',
    file: filename,
    violations,
  };
}
