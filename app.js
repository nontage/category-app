let master = [];
let products = [];
let index = 0;

// Google Apps Script Web API URL（あとで貼る）
const GAS_URL = "https://script.google.com/macros/s/AKfycbxjYt7W_z7PL-Ft6Lg6njY7ZzGhMerH-Sdw4hXnCLHY8hAi81quekgUyxhmMsUb3NOGpQ/exec";

// 初期化
window.onload = async () => {
  master = await fetch("category_master.json").then(r => r.json());
  loadProducts();
  renderProduct();
  setupEvents();
};

// 今回は仮の製品データ構造（のちにスプレッドシート連動）
function loadProducts() {
  products = [
    { sku: "001", title: "商品A", image: "" },
    { sku: "002", title: "商品B", image: "" },
    { sku: "003", title: "商品C", image: "" }
  ];
}

// 商品表示
function renderProduct() {
  const p = products[index];

  document.getElementById("sku").innerText = p.sku;
  document.getElementById("title").innerText = p.title;

  document.getElementById("productImage").src = p.image || "";

  // カテゴリ初期化
  loadCat1();
}

// ▼ カテゴリ1
function loadCat1() {
  const sel = document.getElementById("cat1");
  sel.innerHTML = "<option value=''>選択</option>";

  const list = [...new Set(master.map(m => m.split1).filter(v => v))];
  list.forEach(l => {
    sel.innerHTML += `<option value="${l}">${l}</option>`;
  });
}

// ▼ カテゴリ2以降共通処理
function loadChild(parentKey, level) {
  const nextSel = document.getElementById("cat" + level);
  nextSel.innerHTML = "<option value=''>選択</option>";

  const keys = {};
  master.forEach(m => {
    let match = true;
    for (let i = 1; i < level; i++) {
      const v = document.getElementById("cat" + i).value;
      if (!v || m["split" + i] !== v) match = false;
    }
    if (match && m["split" + level]) {
      keys[m["split" + level]] = true;
    }
  });

  Object.keys(keys).forEach(k => {
    nextSel.innerHTML += `<option value="${k}">${k}</option>`;
  });
}

// セットアップ
function setupEvents() {
  document.getElementById("cat1").onchange = () => loadChild("split1", 2);
  document.getElementById("cat2").onchange = () => loadChild("split2", 3);
  document.getElementById("cat3").onchange = () => loadChild("split3", 4);
  document.getElementById("cat4").onchange = () => loadChild("split4", 5);
  document.getElementById("cat5").onchange = () => loadChild("split5", 6);

  document.getElementById("nextBtn").onclick = nextProduct;
  document.getElementById("saveBtn").onclick = saveToSheet;
  document.getElementById("csvBtn").onclick = downloadCSV;
}

// 次へ
function nextProduct() {
  index++;
  if (index >= products.length) index = 0;
  renderProduct();
}

// CSV 保存
function downloadCSV() {
  let csv = "sku,title,cat1,cat2,cat3,cat4,cat5,cat6\n";
  products.forEach(p => {
    csv += [
      p.sku,
      p.title,
      document.getElementById("cat1").value,
      document.getElementById("cat2").value,
      document.getElementById("cat3").value,
      document.getElementById("cat4").value,
      document.getElementById("cat5").value,
      document.getElementById("cat6").value,
    ].join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "category_export.csv";
  a.click();
}

// スプシ書き込み
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
