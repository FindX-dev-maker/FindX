/* FindX marketplace demo
   Product data is stored in this browser's localStorage. This is a front-end starter,
   not a live commerce backend. See README.md before accepting real payments. */
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
let activeCurrency = read('findx_currency','USD');
let exchangeRateUSDNGN = 1600; // Editable demo rate; not a live FX quote.
const money = n => activeCurrency==='NGN' ? '₦' + (Number(n)*exchangeRateUSDNGN).toLocaleString('en-NG',{maximumFractionDigits:2}) : '$' + Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const seedProducts = [
 {id:'fx101',name:'Studio Wireless Headphones',category:'Electronics',price:49.99,emoji:'🎧',tone:'lavender',tag:'Popular',description:'Comfortable over-ear sound for music, study sessions and everyday listening.',seller:'FindX Select'},
 {id:'fx102',name:'Everyday Canvas Backpack',category:'Fashion',price:34.50,emoji:'🎒',tone:'peach',tag:'Great find',description:'A lightweight daily backpack with room for your essentials.',seller:'FindX Select'},
 {id:'fx103',name:'Minimal Desk Lamp',category:'Home',price:27.00,emoji:'💡',tone:'mint',tag:'Trending',description:'A clean, modern lamp to brighten your workspace or bedside table.',seller:'FindX Select'},
 {id:'fx104',name:'Retro Handheld Console',category:'Gaming',price:59.00,emoji:'🎮',tone:'blue',tag:'Fan favourite',description:'A pocket-sized gaming-inspired collectible for your setup.',seller:'FindX Select'},
 {id:'fx105',name:'Daily Hydration Bottle',category:'Lifestyle',price:18.95,emoji:'🧴',tone:'mint',tag:'Everyday pick',description:'A reusable bottle designed to travel from the gym to your desk.',seller:'FindX Select'},
 {id:'fx106',name:'Mechanical Keyboard',category:'Electronics',price:72.00,emoji:'⌨️',tone:'lavender',tag:'Popular',description:'A satisfying keyboard for your desk, gaming station or home office.',seller:'FindX Select'},
 {id:'fx107',name:'Soft Knit Beanie',category:'Fashion',price:16.00,emoji:'🧢',tone:'peach',tag:'Under $20',description:'An easy-to-style accessory for relaxed everyday outfits.',seller:'FindX Select'},
 {id:'fx108',name:'Creative Sketchbook Set',category:'Art & Crafts',price:21.50,emoji:'🎨',tone:'blue',tag:'Creator pick',description:'A simple starter set for sketches, ideas and creative experiments.',seller:'FindX Select'}
];
const tones = {lavender:'#e9e4ff',peach:'#ffe8dd',mint:'#dff6eb',blue:'#dceeff',yellow:'#fff1c9',rose:'#ffe0ea'};
function read(key, fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
let products = read('findx_products',null);
if(!Array.isArray(products)||products.length===0) products=seedProducts;
let cart = read('findx_cart',[]);
let favourites = read('findx_favourites',[]);
let activeCategory='all', searchTerm='';
let minPrice='', maxPrice='';
let productViews=read('findx_product_views',{});
let checkoutStarts=read('findx_checkout_starts',0);
let demoOrders=read('findx_demo_orders',[]);
let toastTimer;
function notify(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2500)}
function saveProducts(){write('findx_products',products)}
function getCategories(){return ['all',...new Set(products.map(p=>p.category).filter(Boolean).sort())]}
function renderCategories(){
 const categories=getCategories();
 $('#categorySelect').innerHTML='<option value="all">All categories</option>'+categories.filter(c=>c!=='all').map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
 $('#categorySelect').value=categories.includes(activeCategory)?activeCategory:'all';
 $('#categoryChips').innerHTML=categories.map(c=>`<button class="chip ${c===activeCategory?'active':''}" data-category="${escapeHtml(c)}">${c==='all'?'All finds':escapeHtml(c)}</button>`).join('');
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function productVisual(p){return p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">`:`<span class="product-emoji">${escapeHtml(p.emoji||'📦')}</span>`}
function renderProducts(){
 renderCategories();
 let list=products.filter(p=>(activeCategory==='all'||p.category===activeCategory)&&`${p.name} ${p.category} ${p.description} ${p.seller}`.toLowerCase().includes(searchTerm.toLowerCase())&&(minPrice===''||Number(p.price)>=Number(minPrice))&&(maxPrice===''||Number(p.price)<=Number(maxPrice)));
 const sort=$('#sortSelect').value;
 if(sort==='low')list.sort((a,b)=>a.price-b.price);if(sort==='high')list.sort((a,b)=>b.price-a.price);if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
 $('#resultsCount').textContent=`Showing ${list.length} ${list.length===1?'product':'products'}`;
 $('#productGrid').innerHTML=list.map(p=>`<article class="product-card">
 <div class="product-visual" style="background:${p.image?'var(--surface-2)':(tones[p.tone]||'#e9e4ff')}">
 ${productVisual(p)}<span class="tag">${escapeHtml(p.tag||'New find')}</span>
 <button class="heart-button ${favourites.includes(p.id)?'saved':''}" data-fav="${p.id}" aria-label="Save ${escapeHtml(p.name)}">${favourites.includes(p.id)?'♥':'♡'}</button>
 </div><div class="product-info"><div class="product-category">${escapeHtml(p.category||'General')}</div>
 <h3>${escapeHtml(p.name)}</h3><p class="product-desc">${escapeHtml(p.description||'A new find waiting to be discovered.')}</p>
 <div class="product-bottom"><div class="product-price">${money(p.price)}</div><button class="add-cart" data-detail="${p.id}">View item</button></div></div></article>`).join('');
 $('#emptyState').classList.toggle('hidden',list.length>0);$('#productGrid').classList.toggle('hidden',list.length===0);
}
function renderCartCount(){$('#cartCount').textContent=cart.reduce((s,x)=>s+x.qty,0);write('findx_cart',cart)}
function modal(content,wide=false){$('#modalRoot').innerHTML=`<div class="modal-backdrop" data-backdrop><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true">${content}</section></div>`;document.body.style.overflow='hidden'}
function closeModal(){$('#modalRoot').innerHTML='';document.body.style.overflow=''}
function modalHead(title,sub){return `<div class="modal-head"><div><h2>${title}</h2><p>${sub}</p></div><button class="close-modal" data-close aria-label="Close">×</button></div>`}
function openAddProduct(){
 modal(`${modalHead('Add a product','Create a listing for your FindX marketplace.')}
 <form id="productForm"><div class="form-grid">
 <div class="field full"><label for="pName">Product name *</label><input id="pName" name="name" required maxlength="90" placeholder="e.g. Wireless headphones"></div>
 <div class="field"><label for="pPrice">Price (USD) *</label><input id="pPrice" name="price" type="number" min="0.01" step="0.01" required placeholder="25.00"></div>
 <div class="field"><label for="pCategory">Category *</label><input id="pCategory" name="category" required maxlength="35" placeholder="e.g. Electronics"></div>
 <div class="field"><label for="pEmoji">Product icon / emoji</label><input id="pEmoji" name="emoji" maxlength="8" value="📦" placeholder="📦"></div>
 <div class="field"><label for="pTone">Card background</label><select id="pTone" name="tone"><option value="lavender">Lavender</option><option value="peach">Peach</option><option value="mint">Mint</option><option value="blue">Blue</option><option value="yellow">Yellow</option><option value="rose">Rose</option></select></div>
 <div class="field full"><label for="pImageFile">Product photo (camera or gallery)</label><input id="pImageFile" type="file" accept="image/*" capture="environment"><small class="form-note">Choose a photo from your gallery or use your phone camera. Demo photos are stored only in this browser.</small><label for="pImage">Or paste an image URL</label><input id="pImage" name="image" type="url" placeholder="https://example.com/product.jpg"></div>
 <div class="field full"><label for="pDescription">Description</label><textarea id="pDescription" name="description" maxlength="500" placeholder="What makes this product a great find?"></textarea></div>
 <div class="field full"><label for="pSeller">Seller / shop name</label><input id="pSeller" name="seller" maxlength="60" placeholder="Your shop name"></div><div class="field"><label for="pWhatsapp">Seller WhatsApp (optional)</label><input id="pWhatsapp" name="whatsapp" placeholder="2348012345678"></div><div class="field"><label for="pSellerEmail">Seller email (optional)</label><input id="pSellerEmail" name="sellerContactEmail" type="email" placeholder="seller@example.com"></div></div>
 <p class="form-note">Demo listings are saved in this browser only. They are not automatically published to other users or devices.</p>
 <div class="form-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="primary-button" type="submit">Publish demo listing ↗</button></div></form>`,true);
 $('#productForm').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const file=$('#pImageFile').files[0];let image=f.get('image').trim();if(file){if(file.size>1200000){notify('Please choose an image under 1.2 MB for this browser demo.');return;}image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});}const p={id:'fx'+Date.now(),name:f.get('name').trim(),price:Number(f.get('price')),category:f.get('category').trim(),emoji:f.get('emoji')||'📦',tone:f.get('tone'),image,description:f.get('description').trim(),seller:f.get('seller').trim()||'Independent seller',tag:'New listing',whatsapp:f.get('whatsapp')||'',email:f.get('sellerContactEmail')||''};if(!p.name||!p.category||!Number.isFinite(p.price)||p.price<=0)return;products.unshift(p);saveProducts();renderProducts();closeModal();notify('Demo listing added on this browser.');});
}
function openSeller(){
 modal(`${modalHead('Become a FindX seller','Set up your shop and start listing products.')}
 <div class="seller-price"><div><b>$10.00 / month</b><br><small>Monthly seller subscription</small></div><span class="badge-label">SELLER ACCESS</span></div>
 <div class="notice"><b>Payment setup required.</b> This demo cannot collect the $10 monthly subscription yet. Before launch, connect a payment provider and verify payment on a secure server. Never collect or store card details in this static website.</div>
 <form id="sellerForm"><div class="field"><label for="sellerName">Shop name *</label><input id="sellerName" name="shop" required maxlength="60" placeholder="Your shop name"></div>
 <div class="field"><label for="sellerEmail">Email address *</label><input id="sellerEmail" name="email" type="email" required placeholder="you@example.com"></div>
 <div class="field"><label for="sellerBio">What will you sell? (optional)</label><textarea id="sellerBio" name="bio" placeholder="Tell buyers a little about your shop"></textarea></div>
 <p class="form-note">Submitting creates a local demo seller profile only. No fee is charged and no real seller account is created.</p>
 <button class="primary-button wide-button" type="submit">Create demo seller profile</button></form>`,false);
 $('#sellerForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const seller={shop:f.get('shop').trim(),email:f.get('email').trim(),bio:f.get('bio').trim(),createdAt:new Date().toISOString()};write('findx_demo_seller',seller);closeModal();notify(`Demo shop “${seller.shop}” created. No payment was taken.`);openSellerSuccess(seller.shop);});
}
function openSellerSuccess(shop){modal(`${modalHead('Your demo shop is ready!','You can now add sample products to test the seller experience.')}<div class="notice"><b>${escapeHtml(shop)}</b> has been saved in this browser. The $10/month subscription is not active until payment processing is configured.</div><button id="successAdd" class="primary-button wide-button">Add your first product ↗</button><p class="form-note">This is a prototype, not a live account system. Visitors on other devices will not see this profile.</p>`);$('#successAdd').addEventListener('click',openAddProduct)}
function openProduct(id){const p=products.find(x=>x.id===id);if(!p)return;productViews[id]=(productViews[id]||0)+1;write('findx_product_views',productViews);modal(`${modalHead('Product details','A closer look at this find.')}<div class="product-detail"><div class="detail-visual" style="background:${p.image?'var(--surface-2)':(tones[p.tone]||'#e9e4ff')}">${productVisual(p)}</div><div class="detail-copy"><span class="badge-label">${escapeHtml(p.category)}</span><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.description||'A new find waiting to be discovered.')}</p><div class="product-price">${money(p.price)}</div><div class="detail-meta">Sold by ${escapeHtml(p.seller||'FindX seller')}</div>${p.whatsapp?`<a class="primary-button wide-button" style="display:block;text-align:center;text-decoration:none;margin:8px 0" target="_blank" rel="noopener" href="https://wa.me/${escapeHtml(String(p.whatsapp).replace(/[^0-9]/g,''))}">Contact seller on WhatsApp</a>`:''}${p.email?`<a class="secondary-button wide-button" style="display:block;text-align:center;text-decoration:none;margin:8px 0" href="mailto:${escapeHtml(p.email)}">Email seller</a>`:''}<button id="detailAdd" class="primary-button wide-button">Add to cart</button><p class="form-note">Demo product. Availability, delivery, seller verification and buyer protection are not connected yet.</p></div></div>`,true);$('#detailAdd').addEventListener('click',()=>{addToCart(id);closeModal()})}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p)return;const found=cart.find(x=>x.id===id);if(found)found.qty++;else cart.push({id,qty:1});renderCartCount();notify('Added to your cart.')}
function openCart(){
 const rows=cart.map(item=>({...item,product:products.find(p=>p.id===item.id)})).filter(x=>x.product);
 const total=rows.reduce((s,x)=>s+x.product.price*x.qty,0);
 modal(`${modalHead('Your cart',rows.length?`${rows.reduce((s,x)=>s+x.qty,0)} item(s) ready for checkout.`:'Your next great find could be here.')}
 ${rows.length?rows.map(x=>`<div class="cart-row"><div class="cart-thumb">${x.product.image?`<img src="${escapeHtml(x.product.image)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px" alt="">`:escapeHtml(x.product.emoji||'📦')}</div><div><h4>${escapeHtml(x.product.name)}</h4><small>${money(x.product.price)} each</small><div class="qty-control"><button data-qty="${x.id}" data-delta="-1">−</button><span>${x.qty}</span><button data-qty="${x.id}" data-delta="1">+</button><button data-remove="${x.id}" style="width:auto;padding:0 7px">Remove</button></div></div><strong>${money(x.product.price*x.qty)}</strong></div>`).join(''):`<div class="cart-empty">Your cart is empty. Explore the marketplace and add a product.</div>`}
 ${rows.length?`<div class="cart-total"><span>Subtotal</span><span>${money(total)}</span></div><div class="notice">Card checkout is a demo only. No payment will be taken until a payment provider and secure backend are configured.</div><button id="checkoutButton" class="primary-button wide-button">Continue to secure checkout</button>`:`<button class="primary-button wide-button" data-close>Explore products</button>`}`,false);
}
function openCheckout(){
 checkoutStarts++;write('findx_checkout_starts',checkoutStarts);
 const total=cart.reduce((s,x)=>{const p=products.find(p=>p.id===x.id);return s+(p?p.price*x.qty:0)},0);
 modal(`${modalHead('Checkout preview','Review your order before payment.')}
 <div class="seller-price"><div><small>Order subtotal</small><br><b>${money(total)}</b></div><span class="badge-label">DEMO ONLY</span></div>
 <div class="notice"><b>No charge will be made.</b> This website is currently a static prototype. To accept card payments, you must connect a provider such as Paystack or Stripe with server-side payment verification. Do not paste secret keys into this code.</div>
 <div class="field"><label for="payMethod">Payment method</label><select id="payMethod"><option value="card">💳 Debit or credit card</option><option value="crypto">₿ Cryptocurrency</option></select><div class="notice">Demo validation only: payment is not processed. Card data, CVV, crypto seed phrases and private keys must never be collected or saved here.</div></div>
 <button id="checkoutFinish" class="primary-button wide-button">Got it</button>`);
 $('#checkoutFinish').addEventListener('click',()=>{const method=$('#payMethod')?.value||'card';demoOrders.unshift({id:'FX-DEMO-'+Date.now(),amount:total,method,status:'demo-not-paid',date:new Date().toISOString()});write('findx_demo_orders',demoOrders);closeModal();notify('Demo checkout recorded as NOT PAID. No payment was taken.');});
}
function toggleFavourite(id){favourites=favourites.includes(id)?favourites.filter(x=>x!==id):[...favourites,id];write('findx_favourites',favourites);renderProducts();notify(favourites.includes(id)?'Saved to favourites.':'Removed from favourites.')}
function setTheme(theme){document.documentElement.dataset.theme=theme;write('findx_theme',theme);$('#themeToggle').textContent=theme==='dark'?'☀':'☾';$('#themeToggle').setAttribute('aria-label',theme==='dark'?'Switch to light theme':'Switch to dark theme')}
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();searchTerm=$('#searchInput').value.trim();activeCategory=$('#categorySelect').value;renderProducts();$('#marketplace').scrollIntoView({behavior:'smooth'})});
$('#categorySelect').addEventListener('change',e=>{activeCategory=e.target.value;renderProducts()});
$('#categoryChips').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){activeCategory=b.dataset.category;renderProducts()}});
$('#sortSelect').addEventListener('change',renderProducts);
$('#productGrid').addEventListener('click',e=>{const fav=e.target.closest('[data-fav]');if(fav){toggleFavourite(fav.dataset.fav);return}const d=e.target.closest('[data-detail]');if(d)openProduct(d.dataset.detail)});
$('#themeToggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
['sellHeader','heroSell','bannerSell','footerSell'].forEach(id=>$('#'+id).addEventListener('click',openSeller));
['addProductTop','emptyAdd'].forEach(id=>$('#'+id).addEventListener('click',openAddProduct));
$('#cartButton').addEventListener('click',openCart);
$('#productGrid').addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add)addToCart(add.dataset.add)});
$('#modalRoot').addEventListener('click',e=>{
 if(e.target.closest('[data-close]')){closeModal();return}
 if(e.target.matches('[data-backdrop]')){closeModal();return}
 const q=e.target.closest('[data-qty]');if(q){const item=cart.find(x=>x.id===q.dataset.qty);if(item){item.qty+=Number(q.dataset.delta);if(item.qty<1)cart=cart.filter(x=>x.id!==item.id);renderCartCount();openCart()}return}
 const r=e.target.closest('[data-remove]');if(r){cart=cart.filter(x=>x.id!==r.dataset.remove);renderCartCount();openCart();return}
 if(e.target.id==='checkoutButton')openCheckout();
});
$('#year').textContent=new Date().getFullYear();

function openAccount(){
 modal(`${modalHead('Welcome to FindX','Sign in or create a demo account to preview the account experience.')}<div class="notice">This is a front-end demo. It does not create secure accounts or verify passwords on a server. Do not use a real password here.</div><div class="field"><label for="authName">Display name</label><input id="authName" maxlength="60" placeholder="Your name"></div><div class="field"><label for="authEmail">Email address</label><input id="authEmail" type="email" required placeholder="you@example.com"></div><div class="field"><label for="authPassword">Demo password</label><input id="authPassword" type="password" autocomplete="off" placeholder="Demo only — not saved"></div><div class="form-actions"><button id="demoSignIn" class="secondary-button">Log in (demo)</button><button id="demoSignUp" class="primary-button">Create demo account</button></div><p class="form-note">For launch, authentication needs a real auth provider and secure server-side sessions.</p>`);
 const finish=()=>{const email=$('#authEmail').value.trim();if(!email||!email.includes('@')){notify('Enter a valid email address.');return;}const profile={name:$('#authName').value.trim()||email.split('@')[0],email,mode:'demo',createdAt:new Date().toISOString()};write('findx_demo_user',profile);closeModal();notify('Demo account saved in this browser only.');};$('#demoSignIn').addEventListener('click',finish);$('#demoSignUp').addEventListener('click',finish);
}
function openDashboard(){
 const user=read('findx_demo_user',null), seller=read('findx_demo_seller',null);const views=Object.values(productViews).reduce((a,b)=>a+b,0);const total=demoOrders.reduce((s,o)=>s+(o.status==='paid'?o.amount:0),0);
 modal(`${modalHead('FindX dashboard','Demo insights for this browser.')}<div class="dashboard-grid"><div class="dash-stat"><small>Product views</small><strong>${views}</strong></div><div class="dash-stat"><small>Checkout starts</small><strong>${checkoutStarts}</strong></div><div class="dash-stat"><small>Completed paid orders</small><strong>${demoOrders.filter(o=>o.status==='paid').length}</strong></div><div class="dash-stat"><small>Recorded revenue</small><strong>${money(total)}</strong></div></div><h3>Account</h3><p>${user?`Signed in as <b>${escapeHtml(user.email)}</b> (demo)`:'No demo account signed in yet.'}</p><h3>Seller shop</h3><p>${seller?`${escapeHtml(seller.shop)} · ${escapeHtml(seller.email)} · subscription status: <b>Not paid</b>`:'No seller profile created in this browser.'}</p><h3>Recent checkout attempts</h3>${demoOrders.length?demoOrders.slice(0,5).map(o=>`<div class="audit-row"><span>${escapeHtml(o.id)} · ${escapeHtml(o.method)}</span><b>${escapeHtml(o.status.toUpperCase())} · ${money(o.amount)}</b></div>`).join(''):'<p>No checkout attempts yet.</p>'}<p class="form-note">Metrics are local demo data, not shared across users. Failed/successful real payments and revenue require provider webhooks and a secure backend.</p><div class="form-actions"><button class="secondary-button" data-close>Close</button><button id="dashAddProduct" class="primary-button">Add product</button></div>`,true);
 $('#dashAddProduct').addEventListener('click',openAddProduct);
}
function openAdmin(){
 const orders=demoOrders.map(o=>`<div class="audit-row"><span>${escapeHtml(o.id)} · ${escapeHtml(o.method)}</span><b>${escapeHtml(o.status)} · ${money(o.amount)}</b></div>`).join('')||'<p>No demo transactions recorded.</p>';
 modal(`${modalHead('FindX admin vault','Safe demo activity view — no secret credentials are collected.')}<div class="notice"><b>Security rule:</b> This vault intentionally does not store readable passwords, full card numbers, CVV, crypto seed phrases or private keys. Production admin access must require verified admin authentication and server-side permissions.</div><div class="dashboard-grid"><div class="dash-stat"><small>Listings</small><strong>${products.length}</strong></div><div class="dash-stat"><small>Product views</small><strong>${Object.values(productViews).reduce((a,b)=>a+b,0)}</strong></div><div class="dash-stat"><small>Checkout starts</small><strong>${checkoutStarts}</strong></div><div class="dash-stat"><small>Demo transactions</small><strong>${demoOrders.length}</strong></div></div><h3>Transaction log</h3>${orders}<h3>Seller subscription</h3><p>${read('findx_demo_seller',null)?'Demo seller profile exists. Subscription is unpaid / not connected.':'No seller profile saved.'}</p><p class="form-note">This is not a real secured admin vault; localStorage can be edited by a visitor. Never use it for real customer records.</p>`,true);
}
$('#accountButton')?.addEventListener('click',openAccount);$('#footerAccount')?.addEventListener('click',openAccount);$('#dashboardButton')?.addEventListener('click',openDashboard);$('#footerDashboard')?.addEventListener('click',openDashboard);$('#adminButton')?.addEventListener('click',openAdmin);
$('#minPrice')?.addEventListener('input',e=>{minPrice=e.target.value;renderProducts()});$('#maxPrice')?.addEventListener('input',e=>{maxPrice=e.target.value;renderProducts()});
$('#currencySelect')?.addEventListener('change',e=>{activeCurrency=e.target.value;write('findx_currency',activeCurrency);renderProducts()});
$('#clearFilters')?.addEventListener('click',()=>{minPrice='';maxPrice='';activeCategory='all';searchTerm='';$('#minPrice').value='';$('#maxPrice').value='';$('#searchInput').value='';$('#categorySelect').value='all';renderProducts()});
activeCurrency=read('findx_currency','USD');if($('#currencySelect'))$('#currencySelect').value=activeCurrency;

setTheme(read('findx_theme','light'));
renderProducts();renderCartCount();
