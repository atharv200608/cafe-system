/****************************
 GLOBAL CART LOGIC
****************************/
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Add item to cart (from food/drink/desert pages)
function addItem(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`✅ ${name} added to cart`);
}

// Show cart items (cart.html)
function showCart() {
  const cartDiv = document.getElementById("cart-items");
  const totalDiv = document.getElementById("cart-total");
  if (!cartDiv) return;

  cartDiv.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartDiv.innerHTML = "<p>Your cart is empty</p>";
    totalDiv.innerText = "";
    return;
  }

  cart.forEach((item, i) => {
    total += item.price * item.qty;
    cartDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.name} - ₹${item.price * item.qty}</span>
        <span>
          <button onclick="changeQty(${i},1)">+</button>
          ${item.qty}
          <button onclick="changeQty(${i},-1)">−</button>
          <button onclick="removeItem(${i})">Remove</button>
        </span>
      </div>
    `;
  });

  totalDiv.innerHTML = `<strong>Total: ₹${total}</strong>`;
}

// Change quantity
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty < 1) cart[index].qty = 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  showCart();
}

// Remove item
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  showCart();
}

// Proceed to delivery page
function proceedToDelivery() {
  if (cart.length === 0) { alert("❌ Cart is empty"); return; }
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "delivery.html";
}

/****************************
 DELIVERY PAGE
****************************/
function saveDelivery() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address) {
    alert("❌ Fill all delivery details");
    return;
  }

  localStorage.setItem("delivery", JSON.stringify({ name, phone, address }));
  window.location.href = "payment.html";
}

/****************************
 PAYMENT PAGE
****************************/
function loadCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const delivery = JSON.parse(localStorage.getItem("delivery")) || {};

  const summaryDiv = document.getElementById("order-summary");
  if (summaryDiv) {
    summaryDiv.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      summaryDiv.innerHTML += `<p>${item.name} x${item.qty} - ₹${item.price*item.qty}</p>`;
    });
    summaryDiv.innerHTML += `<p><strong>Total: ₹${total}</strong></p>`;
  }

  if (delivery.name && document.getElementById("d-name")) {
    document.getElementById("d-name").innerText = "Name: " + delivery.name;
    document.getElementById("d-phone").innerText = "Phone: " + delivery.phone;
    document.getElementById("d-address").innerText = "Address: " + delivery.address;
  }
}

// Place order
function placeOrder() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) { alert("❌ Cart is empty"); return; }

  const payment = document.querySelector('input[name="pay"]:checked')?.value || "COD";
  const delivery = JSON.parse(localStorage.getItem("delivery")) || {};
  const orderId = "CAF-" + Date.now();

  const order = {
    id: orderId,
    cart,
    paymentMode: payment,
    delivery,
    time: Date.now(),
    status: "Placed"
  };

  localStorage.setItem("currentOrder", JSON.stringify(order));
  localStorage.removeItem("cart");

  alert("✅ Payment Successful");
  window.location.href = "success.html";
}

/****************************
 SUCCESS PAGE
****************************/
function showOrderSuccess() {
  const order = JSON.parse(localStorage.getItem("currentOrder"));
  if (!order) { window.location.href = "index.html"; return; }

  document.getElementById("order-id").innerText = "Order ID: " + order.id;
  document.getElementById("amount").innerText = "₹" + order.cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  document.getElementById("eta").innerText = "30–40 minutes";
}

function cancelOrder() {
  const order = JSON.parse(localStorage.getItem("currentOrder"));
  if (!order) { alert("No order found"); return; }
  const diff = (Date.now() - order.time)/1000;
  if (diff > 120) { alert("❌ Cancellation time expired"); return; }

  if (confirm("⚠ Are you sure you want to cancel this order?")) {
    if(order.paymentMode === "ONLINE") alert("✅ Order cancelled\n💰 Refund processed instantly");
    else alert("✅ Order cancelled\n💸 No payment made");

    localStorage.removeItem("currentOrder");
    window.location.href = "index.html";
  }
}

function goHome() { window.location.href = "index.html"; }
function continueShopping() { window.location.href = "index.html"; }
function trackOrder() { window.location.href = "track.html"; }

/****************************
 TRACK ORDER PAGE
****************************/
function startTracking() {
  const order = JSON.parse(localStorage.getItem("currentOrder"));
  if (!order) { window.location.href="index.html"; return; }

  const statusEl = document.getElementById("status");
  const steps = [
    {time:0,text:"✔ Order Placed"},
    {time:30,text:"✔ Preparing"},
    {time:60,text:"➡ Out for Delivery"},
    {time:90,text:"✔ Delivered"}
  ];

  steps.forEach(step=>{
    setTimeout(()=>{
      const latest = JSON.parse(localStorage.getItem("currentOrder"));
      if(latest && latest.status !== "cancelled") statusEl.innerText = step.text;
    }, step.time*1000);
  });

  // Countdown timer for cancellation demo (2 min)
  let remaining = 120;
  const timerEl = document.getElementById("timer");
  const countdown = setInterval(()=>{
    if(timerEl) {
      const mins = Math.floor(remaining/60);
      const secs = remaining % 60;
      timerEl.innerText = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
    }
    remaining--;
    if(remaining < 0) clearInterval(countdown);
  },1000);
}
