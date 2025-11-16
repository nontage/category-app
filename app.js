let master = [];
let products = [];
let index = 0;

// ★ あなたの Apps Script Webアプリ URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbxsCW4oLJgWszdRyT7Ax_FC6HCacm4BakU-f6dtlQkAB6sz8N4nG7k_BqmtVCS9mw5m0A/exec";

// 初期化
window.onload = async () => {
  master = await fetch("category_master.json").then(r => r.json());

  // ★ スプレッドシートから商品一覧を取得
  products = await fetch(GAS_URL).then(r => r.json());

  console.log("Loaded products:", products);

  index = 0;
  renderProduct();
  setupEvents();
};

// 商品表示
function renderProduct() {
  if (!products[index]) return;

  const p = products[index];

  document.getElementById("sku").innerText = p.sku;
  document.getElementById("title").innerText = p.title;

  // 画像URLがGoogle Drive "view?usp=..." 形式なので imgタグ向けに変換
  const imgUrl = p.image?.replace("view?usp=drivesdk", "preview") || "";

  document.getElementById("productImage").src = imgUrl;

  // カテゴリ1〜6を初期化
  loadCat1(p);
}

// カテゴリ1
function loadCat1(p) {
  const sel = document.getElementById("cat1");
  sel.innerHTML = "<option value=''>選択</option>";

  const list = [...new Set(master.map(m => m.split1).filter(v => v))];
  list.forEach(l => sel.innerHTML += `<option value="${l}">${l}</option>`);

  sel.value = p.cat1 || "";
  loadChild(2, p);
}

// 下層カテゴリ生成
function loadChild(level, p) {
  const sel = document.getElementById("cat" + level);
  sel.innerHTML = "<option value=''>選択</option>";

  const keys = {};
  master.forEach(m => {
    let ok = true;
    for (let i = 1; i < level; i++) {
      const v = document.getElementById("cat" + i).value;
      if (!v || m["split" + i] !== v) ok = false;
    }
    if (ok && m["split" + level]) {
      keys[m["split" + level]] = true;
    }
  });

  Object.keys(keys).forEach(k => sel.innerHTML += `<option value="${k}">${k}</option>`);

  sel.value = p["cat" + level] || "";
}

// 次へ
function nextProduct() {
  index++;
  if (index >= products.length) index = 0;
  renderProduct();
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

  console.log("POST payload", payload);

  await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  alert("保存しました！");
}

// CSV ダウンロード
function downloadCSV() {
  let csv = "sku,title,cat1,cat2,cat3,cat4,cat5,cat6\n";
  products.forEach(p => {
    csv += [
      p.sku,
      p.title,
      p.cat1,
      p.cat2,
      p.cat3,
      p.cat4,
      p.cat5,
      p.cat6
    ].join(",") + "\n";
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "result.csv";
  a.click();
}

// イベント設定
function setupEvents() {
  document.getElementById("cat1").onchange = () => loadChild(2, products[index]);
  document.getElementById("cat2").onchange = () => loadChild(3, products[index]);
  document.getElementById("cat3").onchange = () => loadChild(4, products[index]);
  document.getElementById("cat4").onchange = () => loadChild(5, products[index]);
  document.getElementById("cat5").onchange = () => loadChild(6, products[index]);

  document.getElementById("nextBtn").onclick = nextProduct;
  document.getElementById("saveBtn").onclick = saveToSheet;
  document.getElementById("csvBtn").onclick = downloadCSV;
}
