import * as acorn from 'acorn';
import * as htmlparser2 from 'htmlparser2';

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'sola-' + Math.abs(hash).toString(36);
}

function scopeStyles(css, scopeHash) {
  return css.replace(/([^\r\n,{}]+)(,(?=[^{}]*{)|\s*{)/g, (match, selector, trailing) => {
    if (selector.trim().startsWith('@') || selector.trim().startsWith('from') || selector.trim().startsWith('to') || /^\d+%/.test(selector.trim())) {
      return match;
    }
    const scopedSelector = selector
      .split(',')
      .map(part => {
        const trimmed = part.trim();
        if (!trimmed) return part;
        // Insert scope hash before pseudo-class/element (e.g. button:hover → button.hash:hover)
        const pseudoIdx = trimmed.search(/::?[\w-]/);
        if (pseudoIdx > 0) {
          return `${trimmed.slice(0, pseudoIdx)}.${scopeHash}${trimmed.slice(pseudoIdx)}`;
        }
        return `${trimmed}.${scopeHash}`;
      })
      .join(', ');
    return scopedSelector + trailing;
  });
}

function extractScriptAndStyle(source) {
  let script = '';
  let style = '';
  let template = source;

  const scriptMatch = template.match(/<script(?:\s+lang=["'](?:ts|js)["'])?>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    script = scriptMatch[1];
    template = template.replace(scriptMatch[0], '');
  }

  const styleMatch = template.match(/<style(?:\s+scoped)?>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    style = styleMatch[1];
    template = template.replace(styleMatch[0], '');
  }

  return { script, style, template };
}

function extractExpressions(text) {
  return text.replace(/{([^{}]+)}/g, (match, expr) => {
    const trimmed = expr.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith(':')) {
      return match;
    }
    return `<sola-expr expr="${trimmed.replace(/"/g, '&quot;')}"></sola-expr>`;
  });
}

export function compile(source, options = {}) {
  const { script: scriptContent, style: styleContent, template: rawTemplateSource } = extractScriptAndStyle(source);
  const scopeHash = hashString(styleContent || rawTemplateSource);
  const hasStyles = styleContent.trim().length > 0;
  const scopedCss = hasStyles ? scopeStyles(styleContent, scopeHash) : '';

  let rawTemplate = rawTemplateSource;

  // Pre-process attribute-bound expressions BEFORE extractExpressions.
  // extractExpressions replaces {expr} with <sola-expr> HTML tags, which breaks
  // htmlparser2 when those tags land inside attribute values.
  const dynAttrs = []; // expressions for __soladyn_N__ markers

  // Event handlers: on:event={expr} → on:event="expr"
  rawTemplate = rawTemplate.replace(/\bon:([\w]+)=\{([^}]+)\}/g, 'on:$1="$2"');
  // Bind: bind:prop={expr} → bind:prop="expr"
  rawTemplate = rawTemplate.replace(/\bbind:([\w]+)=\{([^}]+)\}/g, 'bind:$1="$2"');
  // Quoted string interpolation: attr="text {expr} text" → attr="__soladyn_N__"
  // Run iteratively to handle multiple {expr} per value.
  let _prev;
  do {
    _prev = rawTemplate;
    rawTemplate = rawTemplate.replace(/([\w:-]+)="([^"]*\{[^{}]+\}[^"]*)"/g, (_, attr, val) => {
      const jsExpr = '`' + val.replace(/\{([^{}]+)\}/g, (__, e) => `\${${e.trim()}}`) + '`';
      const i = dynAttrs.length;
      dynAttrs.push(jsExpr);
      return `${attr}="__soladyn_${i}__"`;
    });
  } while (rawTemplate !== _prev);
  // Unquoted attr expressions: attr={expr} → attr="__soladyn_N__"
  rawTemplate = rawTemplate.replace(/([\w:-]+)=\{([^{}]+)\}/g, (_, attr, expr) => {
    const i = dynAttrs.length;
    dynAttrs.push(expr.trim());
    return `${attr}="__soladyn_${i}__"`;
  });

  rawTemplate = extractExpressions(rawTemplate);

  // Pre-process logic blocks: structured if-then-else
  // Process nested or sequential if/else blocks cleanly
  rawTemplate = rawTemplate
    .replace(/{#if\s+([\s\S]*?)}([\s\S]*?){:else}([\s\S]*?){\/if}/g, '<sola-if condition="$1"><sola-then>$2</sola-then><sola-else>$3</sola-else></sola-if>')
    .replace(/{#if\s+([\s\S]*?)}([\s\S]*?){\/if}/g, '<sola-if condition="$1"><sola-then>$2</sola-then></sola-if>')
    .replace(/{#each\s+([\s\S]*?)\s+as\s+([\w]+)(?:\s*,\s*([\w]+))?}/g,
      (_, arr, item, index) => `<sola-each array="${arr}" item="${item}"${index ? ` index="${index}"` : ''}>`)
    .replace(/{\/each}/g, '</sola-each>');

  // Parse HTML AST
  const templateNodes = [];
  let root = { type: 'element', name: '__root__', attribs: {}, children: [] };
  templateNodes.push(root);

  const parser = new htmlparser2.Parser({
    onopentag(name, attribs) {
      const node = { type: 'element', name, attribs, children: [] };
      templateNodes[templateNodes.length - 1].children.push(node);
      if (!VOID_ELEMENTS.has(name)) {
        templateNodes.push(node);
      }
    },
    ontext(text) {
      if (text.trim().length > 0 && templateNodes.length > 0) {
        templateNodes[templateNodes.length - 1].children.push({ type: 'text', data: text });
      }
    },
    onclosetag(name) {
      if (templateNodes.length > 1 && !VOID_ELEMENTS.has(name)) {
        templateNodes.pop();
      }
    }
  }, { recognizeSelfClosing: true });

  parser.write(rawTemplate.trim() || '<div></div>');
  parser.end();

  // Parse JS AST with Acorn
  let jsOutput = scriptContent;
  const stateVars = new Set();
  const exportedProps = [];
  const componentImports = [];

  if (scriptContent.trim()) {
    try {
      const ast = acorn.parse(scriptContent, { ecmaVersion: 'latest', sourceType: 'module' });
      const edits = [];

      function walkAST(node, parent) {
        if (!node || typeof node !== 'object') return;

        // Track component imports
        if (node.type === 'ImportDeclaration') {
          const src = node.source.value;
          if (src.endsWith('.sola')) {
            node.specifiers.forEach(spec => {
              componentImports.push({ localName: spec.local.name, path: src });
            });
          }
          edits.push({
            start: node.start,
            end: node.end,
            replacement: `// import hoisted: ${node.source.value}`
          });
        }

        // Exported props
        if (node.type === 'ExportNamedDeclaration' && node.declaration &&
            node.declaration.type === 'VariableDeclaration') {
          node.declaration.declarations.forEach(decl => {
            const name = decl.id.name;
            const defaultVal = decl.init
              ? scriptContent.slice(decl.init.start, decl.init.end)
              : 'undefined';
            exportedProps.push({ name, default: defaultVal });
            edits.push({
              start: node.start,
              end: node.end,
              replacement: ''
            });
          });
        }

        // $state() -> createSignal()
        if (node.type === 'VariableDeclaration') {
          node.declarations.forEach(decl => {
            if (decl.init && decl.init.type === 'CallExpression') {
              const callee = decl.init.callee;
              if (callee.type === 'Identifier' && callee.name === '$state') {
                const varName = decl.id.name;
                stateVars.add(varName);
                const initArg = decl.init.arguments[0];
                const initVal = initArg ? scriptContent.slice(initArg.start, initArg.end) : 'undefined';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `const [${varName}, set_${varName}] = createSignal(${initVal});`
                });
              } else if (callee.type === 'Identifier' && callee.name === '$derived') {
                const varName = decl.id.name;
                const expr = decl.init.arguments[0];
                const exprSrc = expr ? scriptContent.slice(expr.start, expr.end) : 'undefined';
                const isFn = expr && (expr.type === 'ArrowFunctionExpression' || expr.type === 'FunctionExpression');
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: isFn
                    ? `const ${varName} = createDerived(${exprSrc});`
                    : `const ${varName} = createDerived(() => ${exprSrc});`
                });
              } else if (callee.type === 'Identifier' && callee.name === '$effect') {
                const body = decl.init.arguments[0];
                const bodySrc = body ? scriptContent.slice(body.start, body.end) : '() => {}';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `createEffect(${bodySrc});`
                });
              } else if (callee.type === 'Identifier' && callee.name === '$intent') {
                const promptArg = decl.init.arguments[0]
                  ? scriptContent.slice(decl.init.arguments[0].start, decl.init.arguments[0].end)
                  : "''";
                const fallbackArg = decl.init.arguments[1]
                  ? scriptContent.slice(decl.init.arguments[1].start, decl.init.arguments[1].end)
                  : 'null';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `const ${decl.id.name} = createIntent(${promptArg}, ${fallbackArg});`
                });
              } else if (callee.type === 'Identifier' && callee.name === '$data') {
                const sourceArg = decl.init.arguments[0]
                  ? scriptContent.slice(decl.init.arguments[0].start, decl.init.arguments[0].end)
                  : "''";
                const optsArg = decl.init.arguments[1]
                  ? ', ' + scriptContent.slice(decl.init.arguments[1].start, decl.init.arguments[1].end)
                  : '';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `const ${decl.id.name} = createData(${sourceArg}${optsArg});`
                });
              }
            }
          });
        }

        // Assignment to state var: count = x -> set_count(x) (supporting all 10 assignment operators)
        if (node.type === 'AssignmentExpression' &&
            node.left.type === 'Identifier' &&
            stateVars.has(node.left.name)) {
          const name = node.left.name;
          const rightSource = scriptContent.slice(node.right.start, node.right.end);
          if (node.operator === '=') {
            edits.push({ start: node.start, end: node.end, replacement: `set_${name}(${rightSource})` });
          } else {
            const rawOp = node.operator.slice(0, -1);
            edits.push({ start: node.start, end: node.end, replacement: `set_${name}(${name}() ${rawOp} (${rightSource}))` });
          }
        }

        // Update expressions: count++ / count--
        if (node.type === 'UpdateExpression' &&
            node.argument.type === 'Identifier' &&
            stateVars.has(node.argument.name)) {
          const name = node.argument.name;
          const op = node.operator === '++' ? '+' : '-';
          edits.push({
            start: node.start,
            end: node.end,
            replacement: `set_${name}(${name}() ${op} 1)`
          });
        }

        for (const key of Object.keys(node)) {
          if (key === 'type') continue;
          const child = node[key];
          if (Array.isArray(child)) {
            child.forEach(c => walkAST(c, node));
          } else if (child && typeof child === 'object' && child.type) {
            walkAST(child, node);
          }
        }
      }

      walkAST(ast, null);

      edits.sort((a, b) => b.start - a.start);
      for (const edit of edits) {
        jsOutput = jsOutput.slice(0, edit.start) + edit.replacement + jsOutput.slice(edit.end);
      }
    } catch (err) {
      console.warn('[sola compiler] Acorn parse warning:', err.message);
    }
  }

  // Generate DOM creation instructions
  let uid = 0;
  let domCode = '';
  const importedComponentSet = new Set(componentImports.map(i => i.localName));

  function emitNode(node, parentVar) {
    if (!node) return;

    if (node.type === 'text') {
      const text = node.data.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
      if (text.trim().length > 0) {
        const id = `t${uid++}`;
        domCode += `  const ${id} = document.createTextNode(\`${text}\`);\n`;
        domCode += `  ${parentVar}.appendChild(${id});\n`;
      }
      return;
    }

    if (node.name === 'sola-expr') {
      const expr = (node.attribs.expr || '').replace(/&quot;/g, '"');
      const id = `e${uid++}`;
      domCode += `  const ${id} = document.createTextNode('');\n`;
      domCode += `  ${parentVar}.appendChild(${id});\n`;
      domCode += `  createEffect(() => { ${id}.textContent = String(${expr} ?? ''); });\n`;
      return;
    }

    // Nested custom component
    if (importedComponentSet.has(node.name)) {
      const cid = `comp${uid++}`;
      domCode += `  const ${cid}_target = document.createElement('div');\n`;
      domCode += `  ${cid}_target.className = 'sola-component-root';\n`;
      domCode += `  ${parentVar}.appendChild(${cid}_target);\n`;
      const propsObj = {};
      for (const [key, val] of Object.entries(node.attribs || {})) {
        propsObj[key] = val;
      }
      domCode += `  ${node.name}(${cid}_target, ${JSON.stringify(propsObj)});\n`;
      return;
    }

    // {#if ...} {:else} ... {/if}
    if (node.name === 'sola-if') {
      const cid = `c${uid++}`;
      domCode += `  const ${cid}_a = document.createComment('if');\n`;
      domCode += `  ${parentVar}.appendChild(${cid}_a);\n`;
      domCode += `  let ${cid}_els = [];\n`;
      
      const thenChild = node.children.find(c => c.name === 'sola-then');
      const elseChild = node.children.find(c => c.name === 'sola-else');

      domCode += `  createEffect(() => {\n`;
      domCode += `    ${cid}_els.forEach(e => e.remove()); ${cid}_els = [];\n`;
      domCode += `    if (${node.attribs.condition}) {\n`;
      if (thenChild) {
        domCode += `      const f = document.createDocumentFragment();\n`;
        thenChild.children.forEach(child => emitNode(child, 'f'));
        domCode += `      Array.from(f.childNodes).forEach(n => ${cid}_els.push(n));\n`;
        domCode += `      ${cid}_a.parentNode.insertBefore(f, ${cid}_a.nextSibling);\n`;
      }
      domCode += `    } else {\n`;
      if (elseChild) {
        domCode += `      const f = document.createDocumentFragment();\n`;
        elseChild.children.forEach(child => emitNode(child, 'f'));
        domCode += `      Array.from(f.childNodes).forEach(n => ${cid}_els.push(n));\n`;
        domCode += `      ${cid}_a.parentNode.insertBefore(f, ${cid}_a.nextSibling);\n`;
      }
      domCode += `    }\n`;
      domCode += `  });\n`;
      return;
    }

    // {#each} (Rendering in correct ascending order)
    if (node.name === 'sola-each') {
      const eid = `e${uid++}`;
      domCode += `  const ${eid}_a = document.createComment('each');\n`;
      domCode += `  ${parentVar}.appendChild(${eid}_a);\n`;
      domCode += `  let ${eid}_els = [];\n`;
      domCode += `  createEffect(() => {\n`;
      domCode += `    ${eid}_els.forEach(e => e.remove()); ${eid}_els = [];\n`;
      domCode += `    const _items = ${node.attribs.array} || [];\n`;
      domCode += `    const f = document.createDocumentFragment();\n`;
      domCode += `    for (let _i = 0; _i < _items.length; _i++) {\n`;
      domCode += `      const ${node.attribs.item} = _items[_i];\n`;
      if (node.attribs.index) {
        domCode += `      const ${node.attribs.index} = _i;\n`;
      }
      node.children.forEach(child => emitNode(child, 'f'));
      domCode += `    }\n`;
      domCode += `    Array.from(f.childNodes).forEach(n => ${eid}_els.push(n));\n`;
      domCode += `    ${eid}_a.parentNode.insertBefore(f, ${eid}_a.nextSibling);\n`;
      domCode += `  });\n`;
      return;
    }

    // Normal element
    const id = `n${uid++}`;
    domCode += `  const ${id} = document.createElement('${node.name}');\n`;

    if (hasStyles) {
      domCode += `  ${id}.classList.add('${scopeHash}');\n`;
    }

    const BOOLEAN_ATTRS = new Set(['disabled', 'checked', 'selected', 'readonly', 'required', 'multiple', 'open']);
    for (const [key, val] of Object.entries(node.attribs || {})) {
      // Dynamic attribute pre-processed from {expr} in attribute values
      const dynMatch = /^__soladyn_(\d+)__$/.exec(val);
      if (dynMatch) {
        const expr = dynAttrs[parseInt(dynMatch[1])];
        if (BOOLEAN_ATTRS.has(key)) {
          domCode += `  createEffect(() => { const _v = !!(${expr}); if (_v) ${id}.setAttribute('${key}', ''); else ${id}.removeAttribute('${key}'); });\n`;
        } else if (key === 'class' || key === 'className') {
          const suffix = hasStyles ? ` + ' ${scopeHash}'` : '';
          domCode += `  createEffect(() => { ${id}.className = (${expr})${suffix}; });\n`;
        } else {
          domCode += `  createEffect(() => { ${id}.setAttribute('${key}', String(${expr})); });\n`;
        }
        continue;
      }
      if (key.startsWith('on:')) {
        const eventName = key.slice(3);
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(eventName)) continue;
        // val is the handler expression (pre-processed from {expr}), pass directly
        domCode += `  ${id}.addEventListener('${eventName}', ${val});\n`;
      } else if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(eventName)) continue;
        domCode += `  ${id}.addEventListener('${eventName}', ${val});\n`;
      } else if (key.startsWith('bind:')) {
        const prop = key.slice(5);
        if (prop === 'value') {
          domCode += `  ${id}.addEventListener('input', (e) => { set_${val}(e.target.value); });\n`;
          domCode += `  createEffect(() => { ${id}.value = ${val}() ?? ''; });\n`;
        }
      } else if (key === 'class' || key === 'className') {
        domCode += `  ${id}.className += ' ' + \`${val}\`;\n`;
      } else {
        domCode += `  ${id}.setAttribute('${key}', \`${val}\`);\n`;
      }
    }

    domCode += `  ${parentVar}.appendChild(${id});\n`;

    if (node.children && !VOID_ELEMENTS.has(node.name)) {
      for (const child of node.children) {
        emitNode(child, id);
      }
    }
  }

  root.children.forEach(child => emitNode(child, '__target'));

  // Assemble final output module
  let output = '';
  output += `// Compiled by @sola-air-ui/compiler v1.0.1\n`;
  output += `import { createSignal, createDerived, createEffect, createIntent, createData, onMount, onDestroy, pushContext, popContext, __flush_mounts, __flush_destroys } from '@sola-air-ui/core';\n`;

  for (const imp of componentImports) {
    output += `import ${imp.localName} from '${imp.path}';\n`;
  }

  output += `\n`;
  output += `export default function mount(__target, props = {}) {\n`;
  output += `  const __ctx = pushContext();\n\n`;

  if (hasStyles) {
    output += `  if (typeof document !== 'undefined' && !window['__SOLA_STYLE_${scopeHash}']) {\n`;
    output += `    window['__SOLA_STYLE_${scopeHash}'] = true;\n`;
    output += `    const styleEl = document.createElement('style');\n`;
    output += `    styleEl.textContent = \`${scopedCss}\`;\n`;
    output += `    document.head.appendChild(styleEl);\n`;
    output += `  }\n\n`;
  }

  for (const prop of exportedProps) {
    output += `  let ${prop.name} = props.${prop.name} !== undefined ? props.${prop.name} : ${prop.default};\n`;
  }

  output += `\n  // User script\n`;
  output += jsOutput.split('\n').map(l => '  ' + l).join('\n') + '\n\n';

  output += `  // Reactive DOM graph\n`;
  output += domCode;

  output += `\n  __flush_mounts();\n`;
  output += `\n  return () => {\n`;
  output += `    // Cleanup\n`;
  output += `    __flush_destroys();\n`;
  output += `    popContext(__ctx);\n`;
  output += `    __target.innerHTML = '';\n`;
  output += `  };\n`;
  output += `}\n`;

  return {
    code: output,
    scopeHash,
    css: scopedCss
  };
}
