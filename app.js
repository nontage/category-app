let master = [];
let products = [];
let index = 0;

// ★ あなたの Apps Script Webアプリ URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbw9Hy0xwvdtBNYzCYC1ee-2R6GeM69gK_Vd7fYSkEddsVy6cEY4p4f4W4KaFXGP4Qx5oA/exec";

window.onload = async () => {
  master = await fetch("category_master.json").then(r => r.json());

  // ★ 商品データをスプレッドシートから取得（GET）
  products = await fetch(GAS_URL).then(r => r.json());

  index = 0;
  renderProduct();
  setupEvents();
};

// 商品描画
function renderProduct() {
  if (!products[index]) return;

  const p = products[index];

  document.getElementById("sku").innerText = p.sku;
  document.getElementById("title").innerText = p.title;
  document.getElementById("productImage").src = p.image || "";

  loadCat1();
}

// カテゴリ1
function loadCat1() {
  const sel = document.getElementById("cat1");
  sel.innerHTML = "<option value=''>選択</option>";

  const list = [...new Set(master.map(m => m.split1).filter(v => v))];
  list.forEach(l => sel.innerHTML += `<option value="${l}">${l}</option>`);

  // 以前保存されたカテゴリがあればセット
  const p = products[index];
  sel.value = p.cat1 || "";
  loadChild(2);
}

// 下層カテゴリ
function loadChild(level) {
  const sel = document.getElementById("cat" + level);
  sel.innerHTML = "<option value=''>選択</option>";

  const keys = {};
  master.forEach(m => {
    let ok = true;
    for (let i = 1; i < level; i++) {
      const v = document.getElementById("cat" + i).value;
      if (!v || m["split" + i] !== v) ok = false;
    }
    if (ok && m["split" + level]) keys[m["split" + level]] = true;
  });

  Object.keys(keys).forEach(k => sel.innerHTML += `<option value="${k}">${k}</option>`);

  // 以前の値があれば反映
  const p = products[index];
  sel.value = p["cat" + level] || "";
}

// 次の商品
function nextProduct() {
  index++;
  if (index >= products.length) index = 0;
  renderProduct();
}

// CSV ダウンロード
function downloadCSV() {
  let csv = "sku,title,cat1,cat2,cat3,cat4,cat5,cat6\n";
  products.forEach(p => {
    csv += [
      p.sku,
      p.title,
      p.cat1 || "",
      p.cat2 || "",
      p.cat3 || "",
      p.cat4 || "",
      p.cat5 || "",
      p.cat6 || "",
    ].join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "result.csv";
  a.click();
}

// 保存
async function saveToSheet() {
  const payload = {
    sku: document.getElementById("sku").innerText,
    cat1: document.getElementById("cat1").value,
    cat2: document.getElementById("cat2").value,
    cat3: document.getElementById("cat3").value,
    cat4: document.getElementById("cat4").value,
    cat5: document.getElementById("cat5").value,
    cat6: document.getElementById("cat6").value
  };

  await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  alert("保存しました");
}

// イベント設定
function setupEvents() {
  document.getElementById("cat1").onchange = () => loadChild(2);
  document.getElementById("cat2").onchange = () => loadChild(3);
  document.getElementById("cat3").onchange = () => loadChild(4);
  document.getElementById("cat4").onchange = () => loadChild(5);
  document.getElementById("cat5").onchange = () => loadChild(6);

  document.getElementById("nextBtn").onclick = nextProduct;
  document.getElementById("saveBtn").onclick = saveToSheet;
  document.getElementById("csvBtn").onclick = downloadCSV;
}

