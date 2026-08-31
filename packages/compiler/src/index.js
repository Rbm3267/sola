import * as acorn from 'acorn';
import * as htmlparser2 from 'htmlparser2';
import { readFileSync } from 'node:fs';

const { version: COMPILER_VERSION } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

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

  let isTypeScript = false;
  const scriptMatch = template.match(/<script(?:\s+lang=["'](ts|js)["'])?>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    isTypeScript = scriptMatch[1] === 'ts';
    script = scriptMatch[2];
    template = template.replace(scriptMatch[0], '');
  }

  const styleMatch = template.match(/<style(?:\s+scoped)?>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    style = styleMatch[1];
    template = template.replace(styleMatch[0], '');
  }

  return { script, style, template, isTypeScript };
}

// Returns the index of the closing } that matches the { at openPos,
// respecting string literals and nested braces. Returns -1 if unbalanced.
function matchBrace(text, openPos) {
  let depth = 0;
  let inStr = null;
  for (let i = openPos; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { if (--depth === 0) return i; }
  }
  return -1;
}

// Walk the template and resolve {expr} in attribute values using balanced-brace
// matching, storing dynamic expressions in dynAttrs. Event/bind handlers are
// stored as plain strings; other expressions become __soladyn_N__ markers.
function preprocessTemplate(template, dynAttrs) {
  let result = '';
  let i = 0;
  while (i < template.length) {
    // Opening tag (not closing, not comment)
    if (template[i] === '<' && template[i + 1] !== '/' && template[i + 1] !== '!') {
      result += '<';
      i++;
      // Tag name
      while (i < template.length && /[^\s>\/]/.test(template[i])) result += template[i++];
      // Attributes
      while (i < template.length && template[i] !== '>' && !(template[i] === '/' && template[i + 1] === '>')) {
        if (/\s/.test(template[i])) { result += template[i++]; continue; }
        // Attribute name
        let attrName = '';
        while (i < template.length && /[^\s=\/>]/.test(template[i])) attrName += template[i++];
        if (!attrName) { result += template[i++]; continue; }
        if (template[i] !== '=') { result += attrName; continue; }
        i++; // skip =
        if (template[i] === '{') {
          // Unquoted brace expression: attr={expr}
          const closeIdx = matchBrace(template, i);
          if (closeIdx !== -1) {
            const expr = template.slice(i + 1, closeIdx).trim();
            if (!expr.startsWith('#') && !expr.startsWith('/') && !expr.startsWith(':')) {
              if (/^on:?[\w]+$/.test(attrName) || /^bind:[\w]+$/.test(attrName)) {
                result += `${attrName}="${expr}"`;
              } else {
                dynAttrs.push(expr);
                result += `${attrName}="__soladyn_${dynAttrs.length - 1}__"`;
              }
              i = closeIdx + 1;
              continue;
            }
          }
          result += `${attrName}={`; i++;
        } else if (template[i] === '"' || template[i] === "'") {
          // Quoted attribute value — scan for {expr} interpolations
          const quote = template[i++];
          const parts = [];
          let currentText = '';
          let hasDyn = false;
          while (i < template.length && template[i] !== quote) {
            if (template[i] === '{') {
              const closeIdx = matchBrace(template, i);
              if (closeIdx !== -1) {
                const expr = template.slice(i + 1, closeIdx).trim();
                if (!expr.startsWith('#') && !expr.startsWith('/') && !expr.startsWith(':')) {
                  hasDyn = true;
                  parts.push({ text: currentText });
                  currentText = '';
                  parts.push({ expr });
                  i = closeIdx + 1; continue;
                }
              }
            }
            currentText += template[i++];
          }
          parts.push({ text: currentText });
          if (i < template.length) i++; // skip closing quote
          if (hasDyn) {
            // Build a string-concatenation expression instead of a runtime backtick
            // template literal. Confirmed by driving a real browser against a live
            // ServiceNow Service Portal instance: its widget-script delivery pipeline
            // silently mangles `${expr}` interpolation inside a template literal down
            // to bare, unevaluated expression text (e.g. `background: ${x}` becomes
            // the literal string "background: x" — the function reference itself,
            // never called). Every prior "the reactive binding doesn't do anything"
            // report came from this exact code path. Concatenation is semantically
            // identical and isn't affected by whatever that pipeline does to backticks.
            const combined = parts
              .filter((p) => p.expr !== undefined || p.text !== '')
              .map((p) => (p.expr !== undefined ? `(${p.expr})` : JSON.stringify(p.text)))
              .join(' + ');
            dynAttrs.push(combined || `''`);
            result += `${attrName}="__soladyn_${dynAttrs.length - 1}__"`;
          } else {
            result += `${attrName}="${currentText}"`;
          }
        } else {
          result += `${attrName}=`;
        }
        continue;
      }
      if (i < template.length && template[i] === '/') { result += '/'; i++; }
      if (i < template.length && template[i] === '>') { result += '>'; i++; }
      continue;
    }
    result += template[i++];
  }
  return result;
}

// Replace {expr} in text content with <sola-expr> tags, using balanced-brace
// matching so expressions like {fn({key: val})} work correctly.
function extractExpressions(text) {
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '{') {
      const closeIdx = matchBrace(text, i);
      if (closeIdx === -1) { result += text[i++]; continue; }
      const inner = text.slice(i + 1, closeIdx).trim();
      if (inner.startsWith('#') || inner.startsWith('/') || inner.startsWith(':')) {
        result += text.slice(i, closeIdx + 1); i = closeIdx + 1;
      } else if (inner.startsWith('@html')) {
        const htmlExpr = inner.slice('@html'.length).trim();
        result += `<sola-html expr="${htmlExpr.replace(/"/g, '&quot;')}"></sola-html>`;
        i = closeIdx + 1;
      } else {
        result += `<sola-expr expr="${inner.replace(/"/g, '&quot;')}"></sola-expr>`;
        i = closeIdx + 1;
      }
    } else {
      result += text[i++];
    }
  }
  return result;
}

// Strip TypeScript type annotations so Acorn (plain JS parser) can handle
// script blocks written in TS. Covers the common patterns: type annotations,
// interface/type declarations, angle-bracket generics, and `as` casts.
function stripTypeScript(code) {
  // Remove interface and type alias declarations
  code = code.replace(/^\s*(export\s+)?(interface|type)\s+\w[\s\S]*?(?=\n(?:export|const|let|var|function|class|\/\/|$))/gm, '');
  // Remove inline type annotations: `: Type` before = , ) , ; , , or end of line
  code = code.replace(/:\s*[\w<>\[\]|&{},\s.?]+(?=[=,);{}\n])/g, '');
  // Remove `as Type` casts
  code = code.replace(/\s+as\s+[\w<>\[\]|&{}.?]+/g, '');
  // Remove generic type parameters from function/class declarations
  code = code.replace(/<[^>()=]+>(?=\s*\()/g, '');
  return code;
}

export function compile(source, options = {}) {
  const target = options.target || 'esm'; // 'esm' | 'iife'
  const { script: scriptContent, style: styleContent, template: rawTemplateSource, isTypeScript } = extractScriptAndStyle(source);
  const scopeHash = hashString(styleContent || rawTemplateSource);
  const hasStyles = styleContent.trim().length > 0;
  const scopedCss = hasStyles ? scopeStyles(styleContent, scopeHash) : '';

  let rawTemplate = rawTemplateSource;

  // Pre-process attribute-bound expressions BEFORE extractExpressions using
  // balanced-brace matching (handles nested object literals, ternaries, etc.)
  const dynAttrs = [];
  rawTemplate = preprocessTemplate(rawTemplate, dynAttrs);
  rawTemplate = extractExpressions(rawTemplate);

  // Pre-process logic blocks: structured if-then-else
  // Process nested or sequential if/else blocks cleanly
  rawTemplate = rawTemplate
    .replace(/{#if\s+([\s\S]*?)}([\s\S]*?){:else}([\s\S]*?){\/if}/g, '<sola-if condition="$1"><sola-then>$2</sola-then><sola-else>$3</sola-else></sola-if>')
    .replace(/{#if\s+([\s\S]*?)}([\s\S]*?){\/if}/g, '<sola-if condition="$1"><sola-then>$2</sola-then></sola-if>')
    .replace(/{#each\s+([\s\S]*?)\s+as\s+([\w]+)(?:\s*,\s*([\w]+))?(?:\s*\(([^)]+)\))?}/g,
      (_, arr, item, index, key) => `<sola-each array="${arr}" item="${item}"${index ? ` index="${index}"` : ''}${key ? ` key="${key.trim()}"` : ''}>`)
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
  }, { recognizeSelfClosing: true, lowerCaseTags: false, lowerCaseAttributeNames: false });

  parser.write(rawTemplate.trim() || '<div></div>');
  parser.end();

  // Parse JS AST with Acorn
  // Strip TS first — AST positions and all slice() calls operate on the stripped source.
  // Only run on <script lang="ts"> — the strip regex can't reliably distinguish a type
  // annotation's `:` from a ternary's `: falsyBranch` or an object literal's `key: value`,
  // so applying it to plain JS risks corrupting valid code. Scripts that don't opt into TS
  // are left untouched.
  const strippedScript = scriptContent.trim() && isTypeScript ? stripTypeScript(scriptContent) : scriptContent;
  let jsOutput = strippedScript;
  const stateVars = new Set();
  const exportedProps = [];
  const componentImports = [];

  if (strippedScript.trim()) {
    try {
      const ast = acorn.parse(strippedScript, { ecmaVersion: 'latest', sourceType: 'module' });
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
              ? strippedScript.slice(decl.init.start, decl.init.end)
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
                const initVal = initArg ? strippedScript.slice(initArg.start, initArg.end) : 'undefined';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `const [${varName}, set_${varName}] = createSignal(${initVal});`
                });
              } else if (callee.type === 'Identifier' && callee.name === '$derived') {
                const varName = decl.id.name;
                const expr = decl.init.arguments[0];
                const exprSrc = expr ? strippedScript.slice(expr.start, expr.end) : 'undefined';
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
                const bodySrc = body ? strippedScript.slice(body.start, body.end) : '() => {}';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `createEffect(${bodySrc});`
                });
              } else if (callee.type === 'Identifier' && callee.name === '$intent') {
                const promptArg = decl.init.arguments[0]
                  ? strippedScript.slice(decl.init.arguments[0].start, decl.init.arguments[0].end)
                  : "''";
                const fallbackArg = decl.init.arguments[1]
                  ? strippedScript.slice(decl.init.arguments[1].start, decl.init.arguments[1].end)
                  : 'null';
                edits.push({
                  start: node.start,
                  end: node.end,
                  replacement: `const ${decl.id.name} = createIntent(${promptArg}, ${fallbackArg});`
                });
              } else if (callee.type === 'Identifier' && callee.name === '$data') {
                const sourceArg = decl.init.arguments[0]
                  ? strippedScript.slice(decl.init.arguments[0].start, decl.init.arguments[0].end)
                  : "''";
                const optsArg = decl.init.arguments[1]
                  ? ', ' + strippedScript.slice(decl.init.arguments[1].start, decl.init.arguments[1].end)
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
          const rightSource = strippedScript.slice(node.right.start, node.right.end);
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
      const loc = err.loc ? ` (line ${err.loc.line}, col ${err.loc.column})` : '';
      const filePath = typeof options === 'string' ? options : (options.filename || '<script>');
      throw new Error(`[sola compiler] Parse error in ${filePath}${loc}:\n  ${err.message}`);
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
      // Parenthesize expr before `?? ''`: JS forbids mixing ?? with || or && at the
      // same level without explicit grouping (e.g. `col.label || col ?? ''` is a
      // SyntaxError), and any {a || b}-style fallback expression — an extremely
      // common pattern — would otherwise produce invalid generated code.
      domCode += `  createEffect(() => { ${id}.textContent = String((${expr}) ?? ''); });\n`;
      return;
    }

    // {@html expr} — renders expr as raw HTML via innerHTML, unlike {expr} which always
    // goes through textContent. Wrapped in its own element so setting innerHTML can't
    // clobber unrelated sibling nodes. Callers are responsible for trusting/sanitizing
    // whatever markup they pass — same contract as innerHTML anywhere else.
    if (node.name === 'sola-html') {
      const expr = (node.attribs.expr || '').replace(/&quot;/g, '"');
      const id = `h${uid++}`;
      domCode += `  const ${id} = document.createElement('div');\n`;
      domCode += `  ${id}.style.display = 'contents';\n`;
      domCode += `  ${parentVar}.appendChild(${id});\n`;
      domCode += `  createEffect(() => { ${id}.innerHTML = String((${expr}) ?? ''); });\n`;
      return;
    }

    // Nested custom component
    if (importedComponentSet.has(node.name)) {
      const cid = `comp${uid++}`;
      domCode += `  const ${cid}_target = document.createElement('div');\n`;
      domCode += `  ${cid}_target.className = 'sola-component-root';\n`;
      domCode += `  ${parentVar}.appendChild(${cid}_target);\n`;

      // Dynamically-bound props (rows={items}) arrive here as __soladyn_N__ placeholders —
      // resolve them back to the real expression from dynAttrs and pass it as a raw
      // (unquoted) property so the child receives live data, not the placeholder text.
      //
      // `onXxx`-named props (e.g. onChange={handler}) are a special case: preprocessTemplate
      // strips their {expr} down to raw identifier text before this code ever sees them
      // (the same exception that makes real onclick/on:click DOM handlers work), so they
      // never arrive as a __soladyn_N__ placeholder at all. Since preprocessTemplate can't
      // yet tell a component apart from a native element, that exception can't distinguish
      // "this is a DOM event on <button>" from "this is a callback prop on <Toggle>" — so
      // treat any on-prefixed key here as a raw expression too, same as a real dynAttr.
      const propEntries = [];
      for (const [key, val] of Object.entries(node.attribs || {})) {
        const dynMatch = /^__soladyn_(\d+)__$/.exec(val);
        const isEventLikeProp = /^on:?[\w]+$/.test(key);
        const propValue = dynMatch
          ? `(${dynAttrs[parseInt(dynMatch[1], 10)]})`
          : isEventLikeProp
            ? `(${val})`
            : JSON.stringify(val);
        propEntries.push(`${JSON.stringify(key)}: ${propValue}`);
      }

      // Slot content: compile the tag's children into a function the child component can
      // call to project them wherever it renders a <slot> in its own template.
      if (node.children && node.children.length > 0) {
        const slotVar = `${cid}_slot`;
        domCode += `  const ${slotVar} = (__slot_target) => {\n`;
        node.children.forEach(child => emitNode(child, '__slot_target'));
        domCode += `  };\n`;
        propEntries.push(`children: ${slotVar}`);
      }

      domCode += `  ${node.name}(${cid}_target, { ${propEntries.join(', ')} });\n`;
      return;
    }

    // Slot placeholder: projects the children passed by a parent component, if any.
    if (node.name === 'slot') {
      domCode += `  if (typeof props.children === 'function') { props.children(${parentVar}); }\n`;
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

    // {#each} with optional keyed diffing: {#each items as item (item.id)}
    if (node.name === 'sola-each') {
      const eid = `e${uid++}`;
      const keyExpr = node.attribs.key || null;
      domCode += `  const ${eid}_a = document.createComment('each');\n`;
      domCode += `  ${parentVar}.appendChild(${eid}_a);\n`;
      if (keyExpr) {
        // Keyed: maintain a Map<key, Node[]> and reconcile on each run
        domCode += `  let ${eid}_keyMap = new Map();\n`;
        domCode += `  createEffect(() => {\n`;
        domCode += `    const _items = ${node.attribs.array} || [];\n`;
        domCode += `    const _nextKeys = _items.map((${node.attribs.item}, _i) => String(${keyExpr}));\n`;
        domCode += `    // Remove stale keys\n`;
        domCode += `    for (const [_k, _nodes] of ${eid}_keyMap) {\n`;
        domCode += `      if (!_nextKeys.includes(_k)) { _nodes.forEach(n => n.remove()); ${eid}_keyMap.delete(_k); }\n`;
        domCode += `    }\n`;
        domCode += `    // Insert/reorder items\n`;
        domCode += `    let _anchor = ${eid}_a.nextSibling;\n`;
        domCode += `    for (let _i = 0; _i < _items.length; _i++) {\n`;
        domCode += `      const ${node.attribs.item} = _items[_i];\n`;
        if (node.attribs.index) domCode += `      const ${node.attribs.index} = _i;\n`;
        domCode += `      const _key = String(${keyExpr});\n`;
        domCode += `      if (!${eid}_keyMap.has(_key)) {\n`;
        domCode += `        const f = document.createDocumentFragment();\n`;
        node.children.forEach(child => emitNode(child, 'f'));
        domCode += `        const _nodes = Array.from(f.childNodes);\n`;
        domCode += `        ${eid}_keyMap.set(_key, _nodes);\n`;
        domCode += `        ${eid}_a.parentNode.insertBefore(f, _anchor);\n`;
        domCode += `      }\n`;
        domCode += `    }\n`;
        domCode += `  });\n`;
      } else {
        // Unkeyed: full teardown + rebuild
        domCode += `  let ${eid}_els = [];\n`;
        domCode += `  createEffect(() => {\n`;
        domCode += `    ${eid}_els.forEach(e => e.remove()); ${eid}_els = [];\n`;
        domCode += `    const _items = ${node.attribs.array} || [];\n`;
        domCode += `    const f = document.createDocumentFragment();\n`;
        domCode += `    for (let _i = 0; _i < _items.length; _i++) {\n`;
        domCode += `      const ${node.attribs.item} = _items[_i];\n`;
        if (node.attribs.index) domCode += `      const ${node.attribs.index} = _i;\n`;
        node.children.forEach(child => emitNode(child, 'f'));
        domCode += `    }\n`;
        domCode += `    Array.from(f.childNodes).forEach(n => ${eid}_els.push(n));\n`;
        domCode += `    ${eid}_a.parentNode.insertBefore(f, ${eid}_a.nextSibling);\n`;
        domCode += `  });\n`;
      }
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
  const CORE_EXPORTS = 'createSignal, createDerived, createEffect, createIntent, createData, onMount, onDestroy, pushContext, popContext, __flush_mounts, __flush_destroys';
  let output = '';
  output += `// Compiled by @sola-air-ui/compiler v${COMPILER_VERSION}\n`;

  if (target === 'iife') {
    // ServiceNow / no-bundler mode: pull from window.SolaCore global
    output += `(function() {\n`;
    output += `const { ${CORE_EXPORTS} } = window.SolaCore;\n`;
    for (const imp of componentImports) {
      output += `// Note: sub-component ${imp.localName} must be pre-loaded before this script\n`;
    }
    output += `\n`;
    output += `window['${options.exportName || 'SolaComponent'}'] = function mount(__target, props = {}) {\n`;
  } else {
    output += `import { ${CORE_EXPORTS} } from '@sola-air-ui/core';\n`;
    for (const imp of componentImports) {
      output += `import ${imp.localName} from '${imp.path}';\n`;
    }
    output += `\n`;
    output += `export default function mount(__target, props = {}) {\n`;
  }
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
  output += `    __flush_destroys();\n`;
  output += `    popContext(__ctx);\n`;
  output += `    __target.innerHTML = '';\n`;
  output += `  };\n`;
  output += `};\n`;
  if (target === 'iife') {
    output += `})();\n`;
  }

  return {
    code: output,
    scopeHash,
    css: scopedCss
  };
}
