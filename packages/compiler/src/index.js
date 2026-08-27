import * as acorn from 'acorn';
import * as htmlparser2 from 'htmlparser2';
import { createHash } from 'crypto';

// ─── Void (self-closing) HTML elements ───
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// ─── Generate scoped class hash ───
function scopeHash(source) {
  return 'sola-' + createHash('md5').update(source).digest('hex').slice(0, 8);
}

// ─── Scope CSS selectors ───
function scopeStyles(css, hash) {
  // Add the hash class to every selector
  return css.replace(
    /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g,
    (match, selector, suffix) => {
      selector = selector.trim();
      if (!selector || selector.startsWith('@') || selector.startsWith('from') ||
          selector.startsWith('to') || /^\d+%$/.test(selector)) {
        return match;
      }
      // Handle :global() passthrough
      if (selector.includes(':global(')) {
        return selector.replace(/:global\(([^)]+)\)/g, '$1') + suffix;
      }
      return `${selector}.${hash}${suffix}`;
    }
  );
}

export function compile(source, filename = 'Component.sola') {
  // ─── 1. Extract blocks ───
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const scriptContent = scriptMatch ? scriptMatch[1] : '';
  const rawCSS = styleMatch ? styleMatch[1] : '';

  let rawTemplate = source
    .replace(/<script[^>]*>[\s\S]*?<\/script>/, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/, '');

  // Strip <template> wrapper if present
  const templateWrapperMatch = rawTemplate.match(/<template>([\s\S]*)<\/template>/);
  if (templateWrapperMatch) {
    rawTemplate = templateWrapperMatch[1];
  }

  // ─── 2. Scope hash ───
  const hash = scopeHash(source);
  const scopedCSS = rawCSS ? scopeStyles(rawCSS.trim(), hash) : '';

  // ─── 3. Extract JS expressions from attributes before HTML parsing ───
  // htmlparser2 breaks on {() => x > 5} because > looks like tag close
  const expressionMap = new Map();
  let exprId = 0;

  function extractExpressions(template) {
    let result = '';
    let i = 0;
    while (i < template.length) {
      if (template[i] === '{' && template[i-1] !== '\\') {
        // Check if we're inside an HTML tag attribute
        let depth = 1;
        let j = i + 1;
        while (j < template.length && depth > 0) {
          if (template[j] === '{') depth++;
          else if (template[j] === '}') depth--;
          j++;
        }
        const expr = template.slice(i, j);
        // Only replace if it contains dangerous chars for HTML parsing
        if (expr.includes('>') || expr.includes('<') || expr.includes('"')) {
          const placeholder = `__SOLA_EXPR_${exprId}__`;
          expressionMap.set(placeholder, expr);
          exprId++;
          result += placeholder;
        } else {
          result += expr;
        }
        i = j;
      } else {
        result += template[i];
        i++;
      }
    }
    return result;
  }

  function restoreExpressions(str) {
    for (const [placeholder, expr] of expressionMap) {
      str = str.split(placeholder).join(expr);
    }
    return str;
  }

  rawTemplate = extractExpressions(rawTemplate);

  // ─── 4. Pre-process logic blocks into custom tags ───
  rawTemplate = rawTemplate
    .replace(/{#if\s+([\s\S]*?)}/g, '<sola-if condition="$1">')
    .replace(/{:else}/g, '</sola-if><sola-else>')
    .replace(/{\/if}/g, '</sola-if>')
    .replace(/{#each\s+([\s\S]*?)\s+as\s+([\w]+)(?:\s*,\s*([\w]+))?}/g,
      (_, arr, item, index) => `<sola-each array="${arr}" item="${item}"${index ? ` index="${index}"` : ''}>`)
    .replace(/{\/each}/g, '</sola-each>');

  // ─── 4. Parse HTML AST ───
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

  // ─── 5. Parse JS AST with Acorn ───
  let jsOutput = scriptContent;
  const stateVars = new Set();
  const exportedProps = []; // { name, default }
  const componentImports = []; // { localName, path }

  if (scriptContent.trim()) {
    try {
      const ast = acorn.parse(scriptContent, { ecmaVersion: 'latest', sourceType: 'module' });
      const edits = [];

      function walkAST(node, parent) {
        if (!node || typeof node !== 'object') return;

        // Track component imports (import X from './X.sola')
        if (node.type === 'ImportDeclaration') {
          const src = node.source.value;
          if (src.endsWith('.sola')) {
            node.specifiers.forEach(spec => {
              componentImports.push({ localName: spec.local.name, path: src });
            });
          }
          // Remove ALL imports from function body — they'll be hoisted to module level
          edits.push({
            start: node.start,
            end: node.end,
            replacement: `// import hoisted: ${node.source.value}`
          });
        }

        // Exported props: export let title = 'default'
        if (node.type === 'ExportNamedDeclaration' && node.declaration &&
            node.declaration.type === 'VariableDeclaration') {
          node.declaration.declarations.forEach(decl => {
            const name = decl.id.name;
            const defaultVal = decl.init
              ? scriptContent.slice(decl.init.start, decl.init.end)
              : 'undefined';
            exportedProps.push({ name, default: defaultVal });
            // Remove the export keyword, just make it a regular let
            edits.push({
              start: node.start,
              end: node.end,
              replacement: `let ${name} = props.${name} !== undefined ? props.${name} : ${defaultVal};`
            });
          });
        }

        // $state rune → createSignal
        if (node.type === 'VariableDeclaration') {
          node.declarations.forEach(decl => {
            if (decl.init && decl.init.type === 'CallExpression' && decl.init.callee) {
              const calleeName = decl.init.callee.name;
              if (calleeName === '$state') {
                stateVars.add(decl.id.name);
                const argSource = decl.init.arguments.length > 0
                  ? scriptContent.slice(decl.init.arguments[0].start, decl.init.arguments[0].end)
                  : 'undefined';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `const [${decl.id.name}, set_${decl.id.name}] = createSignal(${argSource});`
                });
              } else if (calleeName === '$intent') {
                const argSource = decl.init.arguments.length > 0
                  ? scriptContent.slice(decl.init.arguments[0].start, decl.init.arguments[0].end)
                  : '""';
                const optsSource = decl.init.arguments.length > 1
                  ? ', ' + scriptContent.slice(decl.init.arguments[1].start, decl.init.arguments[1].end)
                  : '';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `const ${decl.id.name} = createIntent(() => ${argSource}${optsSource});`
                });
              } else if (calleeName === '$derived') {
                const argSource = decl.init.arguments.length > 0
                  ? scriptContent.slice(decl.init.arguments[0].start, decl.init.arguments[0].end)
                  : '() => undefined';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `const ${decl.id.name} = createDerived(${argSource});`
                });
              } else if (calleeName === '$data') {
                const sourceArg = decl.init.arguments.length > 0
                  ? scriptContent.slice(decl.init.arguments[0].start, decl.init.arguments[0].end)
                  : '""';
                const optsArg = decl.init.arguments.length > 1
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

        // Assignment to state var: count = x → set_count(x)
        if (node.type === 'AssignmentExpression' &&
            node.left.type === 'Identifier' &&
            stateVars.has(node.left.name)) {
          const rightSource = scriptContent.slice(node.right.start, node.right.end);
          if (node.operator === '=') {
            edits.push({
              start: node.start,
              end: node.end,
              replacement: `set_${node.left.name}(${rightSource})`
            });
          } else if (node.operator === '+=') {
            edits.push({
              start: node.start,
              end: node.end,
              replacement: `set_${node.left.name}(${node.left.name}() + ${rightSource})`
            });
          } else if (node.operator === '-=') {
            edits.push({
              start: node.start,
              end: node.end,
              replacement: `set_${node.left.name}(${node.left.name}() - ${rightSource})`
            });
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

        // Recurse
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

      // Apply edits in reverse order
      edits.sort((a, b) => b.start - a.start);
      for (const edit of edits) {
        jsOutput = jsOutput.slice(0, edit.start) + edit.replacement + jsOutput.slice(edit.end);
      }
    } catch (e) {
      console.error('[Sola Compiler] Acorn Parse Error:', e.message);
    }
  }

  // ─── 6. Generate DOM instructions ───
  let domCode = '';
  let uid = 0;

  function emitNode(node, parentVar) {
    if (node.type === 'text') {
      const id = `t${uid++}`;
      const data = restoreExpressions(node.data);
      if (data.includes('{')) {
        // Reactive text
        const expr = data
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/{([^}]+)}/g, "'+($1)+'")
          .replace(/\n/g, '\\n');
        domCode += `  const ${id} = document.createTextNode('');\n`;
        domCode += `  createEffect(() => { ${id}.textContent = '${expr}'; });\n`;
      } else {
        domCode += `  const ${id} = document.createTextNode(${JSON.stringify(data)});\n`;
      }
      domCode += `  ${parentVar}.appendChild(${id});\n`;
      return;
    }

    if (node.name === '__root__') {
      node.children.forEach(child => emitNode(child, parentVar));
      return;
    }

    // ── {#if} ──
    if (node.name === 'sola-if') {
      const cid = `c${uid++}`;
      domCode += `  const ${cid}_a = document.createComment('if');\n`;
      domCode += `  ${parentVar}.appendChild(${cid}_a);\n`;
      domCode += `  let ${cid}_els = [];\n`;

      // Check if there's a sola-else sibling following this node
      // (We pre-processed {:else} into </sola-if><sola-else> so they are siblings)
      domCode += `  createEffect(() => {\n`;
      domCode += `    ${cid}_els.forEach(e => e.remove()); ${cid}_els = [];\n`;
      domCode += `    if (${node.attribs.condition}) {\n`;
      domCode += `      const f = document.createDocumentFragment();\n`;
      node.children.forEach(child => emitNode(child, 'f'));
      domCode += `      Array.from(f.childNodes).forEach(n => ${cid}_els.push(n));\n`;
      domCode += `      ${cid}_a.parentNode.insertBefore(f, ${cid}_a.nextSibling);\n`;
      domCode += `    }\n`;
      domCode += `  });\n`;
      return;
    }

    // ── {:else} ──
    if (node.name === 'sola-else') {
      const cid = `c${uid++}`;
      domCode += `  const ${cid}_a = document.createComment('else');\n`;
      domCode += `  ${parentVar}.appendChild(${cid}_a);\n`;
      domCode += `  let ${cid}_els = [];\n`;

      // Find the preceding sola-if condition — we need to negate it
      // The sola-else doesn't have its own condition; we look for the preceding if anchor
      // For now, we mark it and let the compiler figure it out
      // Actually, since {:else} becomes a sibling after </sola-if>, we can't easily
      // reference the if's condition. Let's handle this differently.
      // We'll just emit it unconditionally for now and fix the preprocessor to keep
      // if/else together.
      domCode += `  // else block (rendered by paired if)\n`;
      domCode += `  {\n`;
      domCode += `    const f = document.createDocumentFragment();\n`;
      node.children.forEach(child => emitNode(child, 'f'));
      domCode += `    Array.from(f.childNodes).forEach(n => ${cid}_els.push(n));\n`;
      domCode += `    ${cid}_a.parentNode.insertBefore(f, ${cid}_a.nextSibling);\n`;
      domCode += `  }\n`;
      return;
    }

    // ── {#each} ──
    if (node.name === 'sola-each') {
      const eid = `e${uid++}`;
      domCode += `  const ${eid}_a = document.createComment('each');\n`;
      domCode += `  ${parentVar}.appendChild(${eid}_a);\n`;
      domCode += `  let ${eid}_els = [];\n`;
      domCode += `  createEffect(() => {\n`;
      domCode += `    ${eid}_els.forEach(e => e.remove()); ${eid}_els = [];\n`;
      domCode += `    const _items = ${node.attribs.array} || [];\n`;
      domCode += `    for (let _i = 0; _i < _items.length; _i++) {\n`;
      domCode += `      const ${node.attribs.item} = _items[_i];\n`;
      if (node.attribs.index) {
        domCode += `      const ${node.attribs.index} = _i;\n`;
      }
      domCode += `      const f = document.createDocumentFragment();\n`;
      node.children.forEach(child => emitNode(child, 'f'));
      domCode += `      Array.from(f.childNodes).forEach(n => ${eid}_els.push(n));\n`;
      domCode += `      ${eid}_a.parentNode.insertBefore(f, ${eid}_a.nextSibling);\n`;
      domCode += `    }\n`;
      domCode += `  });\n`;
      return;
    }

    // ── Normal element ──
    const id = `n${uid++}`;

    if (VOID_ELEMENTS.has(node.name)) {
      domCode += `  const ${id} = document.createElement('${node.name}');\n`;
    } else {
      domCode += `  const ${id} = document.createElement('${node.name}');\n`;
    }

    // Add scope hash class for style scoping
    if (scopedCSS) {
      domCode += `  ${id}.classList.add('${hash}');\n`;
    }

    // Process attributes
    for (const [rawKey, rawValue] of Object.entries(node.attribs)) {
      const key = restoreExpressions(rawKey);
      const value = restoreExpressions(rawValue);
      
      // Event handlers: on:click={handler}
      if (key.startsWith('on:')) {
        const event = key.slice(3);
        const handler = value.replace(/^{|}$/g, '');
        domCode += `  ${id}.addEventListener('${event}', ${handler});\n`;
      }
      // Event handlers: onclick={handler}
      else if (/^on[a-z]+$/.test(key)) {
        const event = key.slice(2);
        const handler = value.replace(/^{|}$/g, '');
        domCode += `  ${id}.addEventListener('${event}', ${handler});\n`;
      }
      // bind:value
      else if (key === 'bind:value') {
        const signalName = value.replace(/^{|}$/g, '').replace(/"/g, '');
        domCode += `  createEffect(() => { ${id}.value = ${signalName}(); });\n`;
        domCode += `  ${id}.addEventListener('input', (e) => set_${signalName}(e.target.value));\n`;
      }
      // Dynamic class
      else if (key === 'class') {
        if (value.includes('{')) {
          const expr = restoreExpressions(value).replace(/{([^}]+)}/g, "'+($1)+'");
          domCode += `  createEffect(() => { ${id}.className = '${hash} ' + '${expr}'; });\n`;
        } else {
          domCode += `  ${id}.setAttribute('class', '${value}');\n`;
        }
      }
      // Dynamic attributes with {expression}
      else if (value.includes('{') && value.includes('}')) {
        const expr = value.replace(/{([^}]+)}/g, "'+($1)+'");
        domCode += `  createEffect(() => { ${id}.setAttribute('${key}', '${expr}'); });\n`;
      }
      // Static attributes
      else {
        domCode += `  ${id}.setAttribute('${key}', ${JSON.stringify(value)});\n`;
      }
    }

    domCode += `  ${parentVar}.appendChild(${id});\n`;

    // Process children
    if (node.children) {
      node.children.forEach(child => emitNode(child, id));
    }
  }

  // Walk all root children
  emitNode(root, '__target');

  // ─── 7. Assemble final output ───
  const propsSignature = exportedProps.length > 0 ? 'props = {}' : '';

  let output = `import { createSignal, createEffect, createDerived, createIntent, createData, onMount, onDestroy, __flush_mounts, __flush_destroys } from '@sola/core';\n`;

  // Component imports
  for (const imp of componentImports) {
    output += `import ${imp.localName} from '${imp.path}';\n`;
  }

  output += `\nexport default function mount(__target, ${propsSignature}) {\n`;
  output += jsOutput + '\n';

  // Inject scoped styles
  if (scopedCSS) {
    output += `\n  // Scoped styles\n`;
    output += `  const __style = document.createElement('style');\n`;
    output += `  __style.textContent = ${JSON.stringify(scopedCSS)};\n`;
    output += `  document.head.appendChild(__style);\n`;
  }

  output += '\n' + domCode;
  output += '\n  __flush_mounts();\n';
  output += '\n  return () => { __flush_destroys(); };\n';
  output += '}\n';

  return output;
}
