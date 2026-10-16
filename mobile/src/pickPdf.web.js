export function pickPdf() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.style.display = 'none';
    document.body.appendChild(input);
    let settled = false;
    const done = (v) => { if (settled) return; settled = true; input.remove(); resolve(v); };
    input.onchange = () => {
      const f = input.files && input.files[0];
      done(f ? { file: f, name: f.name } : null);
    };
    input.oncancel = () => done(null);
    input.click();
  });
}
