/* FindX marketplace demo
   Product data is stored in this browser's localStorage. This is a front-end starter,
   not a live commerce backend. See README.md before accepting real payments. */
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const money = n => '$' + Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
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
if(!Array.isArray(products) || products.length===0) products = seedProducts;
let cart = read('findx_cart',[]);
let favourites = read('findx_favourites',[]);
let activeCategory='all', searchTerm='';
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
 let list=products.filter(p=>(activeCategory==='all'||p.category===activeCategory)&&`${p.name} ${p.category} ${p.description} ${p.seller}`.toLowerCase().includes(searchTerm.toLowerCase()));
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
 <div class="field full"><label for="pImage">Image URL (optional)</label><input id="pImage" name="image" type="url" placeholder="https://example.com/product.jpg"><small class="form-note">Use an image URL you have permission to use. For a production site, upload images to storage instead.</small></div>
 <div class="field full"><label for="pDescription">Description</label><textarea id="pDescription" name="description" maxlength="500" placeholder="What makes this product a great find?"></textarea></div>
 <div class="field full"><label for="pSeller">Seller / shop name</label><input id="pSeller" name="seller" maxlength="60" placeholder="Your shop name"></div></div>
 <p class="form-note">Demo listings are saved in this browser only. They are not automatically published to other users or devices.</p>
 <div class="form-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="primary-button" type="submit">Publish demo listing ↗</button></div></form>`,true);
 $('#productForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const p={id:'fx'+Date.now(),name:f.get('name').trim(),price:Number(f.get('price')),category:f.get('category').trim(),emoji:f.get('emoji')||'📦',tone:f.get('tone'),image:f.get('image').trim(),description:f.get('description').trim(),seller:f.get('seller').trim()||'Independent seller',tag:'New listing'};if(!p.name||!p.category||!Number.isFinite(p.price)||p.price<=0)return;products.unshift(p);saveProducts();renderProducts();closeModal();notify('Product added to this browser’s demo marketplace.');});
}
function openSeller(){
 modal(`${modalHead('Become a FindX seller','Set up your shop and start listing products.')}
 <div class="seller-price"><div><b>$10.00</b><br><small>Monthly seller subscription</small></div><span class="badge-label">SELLER ACCESS</span></div>
 <div class="notice"><b>Payment setup required.</b> This demo cannot collect the $10 fee yet. Before launch, connect a payment provider and verify payment on a secure server. Never collect or store card details in this static website.</div>
 <form id="sellerForm"><div class="field"><label for="sellerName">Shop name *</label><input id="sellerName" name="shop" required maxlength="60" placeholder="Your shop name"></div>
 <div class="field"><label for="sellerEmail">Email address *</label><input id="sellerEmail" name="email" type="email" required placeholder="you@example.com"></div>
 <div class="field"><label for="sellerBio">What will you sell? (optional)</label><textarea id="sellerBio" name="bio" placeholder="Tell buyers a little about your shop"></textarea></div>
 <p class="form-note">Submitting creates a local demo seller profile only. No fee is charged and no real seller account is created.</p>
 <button class="primary-button wide-button" type="submit">Create demo seller profile</button></form>`,false);
 $('#sellerForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const seller={shop:f.get('shop').trim(),email:f.get('email').trim(),bio:f.get('bio').trim(),createdAt:new Date().toISOString()};write('findx_demo_seller',seller);closeModal();notify(`Demo shop “${seller.shop}” created. No payment was taken.`);openSellerSuccess(seller.shop);});
}
function openSellerSuccess(shop){modal(`${modalHead('Your demo shop is ready!','You can now add sample products to test the seller experience.')}<div class="notice"><b>${escapeHtml(shop)}</b> has been saved in this browser. The $10/month subscription is not active until payment processing is configured.</div><button id="successAdd" class="primary-button wide-button">Add your first product ↗</button><p class="form-note">This is a prototype, not a live account system. Visitors on other devices will not see this profile.</p>`);$('#successAdd').addEventListener('click',openAddProduct)}
function openProduct(id){const p=products.find(x=>x.id===id);if(!p)return;modal(`${modalHead('Product details','A closer look at this find.')}<div class="product-detail"><div class="detail-visual" style="background:${p.image?'var(--surface-2)':(tones[p.tone]||'#e9e4ff')}">${productVisual(p)}</div><div class="detail-copy"><span class="badge-label">${escapeHtml(p.category)}</span><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.description||'A new find waiting to be discovered.')}</p><div class="product-price">${money(p.price)}</div><div class="detail-meta">Sold by ${escapeHtml(p.seller||'FindX seller')}</div><button id="detailAdd" class="primary-button wide-button">Add to cart</button><p class="form-note">Demo product. Availability, delivery, seller verification and buyer protection are not connected yet.</p></div></div>`,true);$('#detailAdd').addEventListener('click',()=>{addToCart(id);closeModal()})}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p)return;const found=cart.find(x=>x.id===id);if(found)found.qty++;else cart.push({id,qty:1});renderCartCount();notify('Added to your cart.')}
function openCart(){
 const rows=cart.map(item=>({...item,product:products.find(p=>p.id===item.id)})).filter(x=>x.product);
 const total=rows.reduce((s,x)=>s+x.product.price*x.qty,0);
 modal(`${modalHead('Your cart',rows.length?`${rows.reduce((s,x)=>s+x.qty,0)} item(s) ready for checkout.`:'Your next great find could be here.')}
 ${rows.length?rows.map(x=>`<div class="cart-row"><div class="cart-thumb">${x.product.image?`<img src="${escapeHtml(x.product.image)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px" alt="">`:escapeHtml(x.product.emoji||'📦')}</div><div><h4>${escapeHtml(x.product.name)}</h4><small>${money(x.product.price)} each</small><div class="qty-control"><button data-qty="${x.id}" data-delta="-1">−</button><span>${x.qty}</span><button data-qty="${x.id}" data-delta="1">+</button><button data-remove="${x.id}" style="width:auto;padding:0 7px">Remove</button></div></div><strong>${money(x.product.price*x.qty)}</strong></div>`).join(''):`<div class="cart-empty">Your cart is empty. Explore the marketplace and add a product.</div>`}
 ${rows.length?`<div class="cart-total"><span>Subtotal</span><span>${money(total)}</span></div><div class="notice">Card checkout is a demo only. No payment will be taken until a payment provider and secure backend are configured.</div><button id="checkoutButton" class="primary-button wide-button">Continue to secure checkout</button>`:`<button class="primary-button wide-button" data-close>Explore products</button>`}`,false);
}
function openCheckout(){
 const total=cart.reduce((s,x)=>{const p=products.find(p=>p.id===x.id);return s+(p?p.price*x.qty:0)},0);
 modal(`${modalHead('Checkout preview','Review your order before payment.')}
 <div class="seller-price"><div><small>Order subtotal</small><br><b>${money(total)}</b></div><span class="badge-label">DEMO ONLY</span></div>
 <div class="notice"><b>No charge will be made.</b> This website is currently a static prototype. To accept card payments, you must connect a provider such as Paystack or Stripe with server-side payment verification. Do not paste secret keys into this code.</div>
 <div class="field"><label>Payment method</label><div class="notice">💳 Debit or credit card — not connected</div></div>
 <button id="checkoutFinish" class="primary-button wide-button">Got it</button>`);
 $('#checkoutFinish').addEventListener('click',()=>{closeModal();notify('Checkout is not live yet. No payment was taken.')});
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
setTheme(read('findx_theme','light'));
renderProducts();renderCartCount();
