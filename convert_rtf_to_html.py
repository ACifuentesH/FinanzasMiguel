# -*- coding: utf-8 -*-
"""Convert RTF-wrapped HTML file to clean HTML."""
import re
import sys

def rtf_char(m):
    return chr(int(m.group(1), 16))

def rtf_unicode(m):
    n = int(m.group(1))
    if n < 0:
        n += 65536
    if 0 <= n < 0x110000 and not (0xD800 <= n <= 0xDFFF):
        return chr(n)
    return ''  # skip surrogates; they may be paired next

def main():
    path = r"c:\Users\aleja\OneDrive\7mo semestre\miguelini\Untitled-1.html"
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        raw = f.read()

    # Skip RTF header (until we see content that looks like HTML)
    lines = raw.split('\n')
    start = 0
    for i, line in enumerate(lines):
        if '<!doctype html>' in line.lower() or '<!DOCTYPE' in line:
            # Find the line that starts the doctype (might be in the middle of a line)
            start = i
            break
        if '<html' in line or '<head' in line:
            start = i
            break

    content = '\n'.join(lines[start:])
    # Start from first HTML tag (strip RTF prefix like \f0\fs24 \cf0 )
    idx = content.find('<!')
    if idx < 0:
        idx = content.find('<')
    if idx >= 0:
        content = content[idx:]

    # Join RTF line continuations: \ at end of line -> remove \ and newline (join)
    content = re.sub(r'\\\s*\n', '\n', content)

    # Unescape RTF braces
    content = content.replace('\\{', '{').replace('\\}', '}')

    # RTF hex chars: \'XX (2 hex digits) -> Latin-1 char
    content = re.sub(r"\\'([0-9a-fA-F]{2})", rtf_char, content)

    # RTF Unicode: \uNNNN? and \uc0 \uNNNN
    content = re.sub(r'\\uc0\s*\\u(\d+)', rtf_unicode, content)
    content = re.sub(r'\\u(-?\d+)\s*', rtf_unicode, content)

    # Remove the Cloudflare / challenge script (last script before </body>)
    content = re.sub(
        r'<script>\(function\(\)\{function c\(\)\{[^<]*</script>\s*</body>',
        '</body>',
        content,
        flags=re.DOTALL
    )

    # Remove SDK script tags and add localStorage stub before </head>
    content = content.replace(
        '<script src="/_sdk/data_sdk.js"></script>\n  <script src="/_sdk/element_sdk.js"></script>',
        '''<!-- SDK stubs for standalone run -->
  <script>
  (function() {
    var store = JSON.parse(localStorage.getItem('miguelini_data') || '[]');
    window.dataSdk = {
      _store: store,
      _handler: null,
      init: function(handler) {
        this._handler = handler;
        this._store = JSON.parse(localStorage.getItem('miguelini_data') || '[]');
        if (handler && handler.onDataChanged) handler.onDataChanged(this._store);
        return Promise.resolve({ isOk: true });
      },
      create: function(item) {
        item.__backendId = 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        this._store.push(item);
        localStorage.setItem('miguelini_data', JSON.stringify(this._store));
        if (this._handler && this._handler.onDataChanged) this._handler.onDataChanged(this._store);
        return Promise.resolve({ isOk: true });
      },
      update: function(item) {
        var i = this._store.findIndex(function(x) { return x.__backendId === item.__backendId; });
        if (i >= 0) { this._store[i] = item; localStorage.setItem('miguelini_data', JSON.stringify(this._store)); }
        if (this._handler && this._handler.onDataChanged) this._handler.onDataChanged(this._store);
        return Promise.resolve({ isOk: true });
      },
      delete: function(item) {
        this._store = this._store.filter(function(x) { return x.__backendId !== item.__backendId; });
        localStorage.setItem('miguelini_data', JSON.stringify(this._store));
        if (this._handler && this._handler.onDataChanged) this._handler.onDataChanged(this._store);
        return Promise.resolve({ isOk: true });
      }
    };
    window.elementSdk = {
      config: {},
      init: function(opts) {
        if (opts && opts.defaultConfig) window.elementSdk.config = Object.assign({}, opts.defaultConfig);
        return Promise.resolve({ isOk: true });
      },
      setConfig: function(c) { Object.assign(window.elementSdk.config, c); }
    };
  })();
  </script>'''
    )

    # Fix SVG: viewbox -> viewBox (case-sensitive in SVG)
    content = re.sub(r'\bviewbox\b', 'viewBox', content, flags=re.IGNORECASE)

    # Replace lone surrogates (from RTF emoji) with safe chars so UTF-8 encodes
    content = content.encode('utf-8', errors='replace').decode('utf-8')

    out_path = r"c:\Users\aleja\OneDrive\7mo semestre\miguelini\dashboard.html"
    with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

    print("Written:", out_path)
    return 0

if __name__ == '__main__':
    sys.exit(main())
