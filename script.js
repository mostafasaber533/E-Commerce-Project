let cart = [];
let products = [];

const loadProducts = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "products.json");

    xhr.onload = function () {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.products);
      } else {
        reject("Error loading products");
      }
    };

    xhr.onerror = function () {
      reject("Network Error");
    };

    xhr.send();
  });
};

const displayProducts = (products, category = "all") => {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  products.forEach((product) => {
    if (category === "all" || product.category === category) {
      const productCard = `
                <div class="col-md-4">
                    <div class="card product-card" data-id="${product.id}">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">$${product.price}</p>
                            <button class="btn btn-primary add-to-cart"> Add To Cart </button>
                        </div>
                    </div>
                </div>
            `;
      container.innerHTML += productCard;
    }
  });
};

const addToCart = (productId) => {
  const product = products.find((p) => p.id === productId);
  if (product) {
    cart.push(product);
    updateCartCount();
    updateCartModal();
  }
};

const updateCartCount = () => {
  document.querySelector(".cart-count").textContent = cart.length;
};

const updateCartModal = () => {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";

  let total = 0;

  const cartSummary = cart.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = {
        ...item,
        quantity: 1,
      };
    } else {
      acc[item.id].quantity += 1;
    }
    return acc;
  }, {});

  Object.values(cartSummary).forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartItems.innerHTML += `
      <div class="cart-item">
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" class="me-2">
          <div>
            <h6 class="mb-0">${item.name}</h6>
            <small class="text-muted">Price: $${item.price}</small>
          </div>
        </div>
        <div class="d-flex align-items-center">
          <div class="quantity-controls me-2">
            <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
            <span class="mx-2">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
          </div>
          <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `;
  });

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-center"> Cart Empty</p>';
  }

  document.getElementById("cart-total").textContent = total.toFixed(2);
};

const displayBestSellers = () => {
  const bestSellerContainer = document.getElementById("bestseller-container");
  const bestSellers = products.slice(0, 4);  

  bestSellerContainer.innerHTML = bestSellers
    .map(
      (product) => `
        <div class="col-md-3">
            <div class="card product-card" data-id="${product.id}">
                <div class="badge bg-danger position-absolute top-0 end-0 m-2">Best Seller</div>
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">$${product.price}</p>
                    <button class="btn btn-primary add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
};

document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
    .then((loadedProducts) => {
      products = loadedProducts;
      displayProducts(products);
      displayBestSellers();   
    })
    .catch((error) => console.error(error));

  document.getElementById("bestseller-container").addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const productId = parseInt(e.target.closest(".product-card").dataset.id);
      addToCart(productId);
    }
  });

  document.querySelector(".categories").addEventListener("click", (e) => {
    if (e.target.classList.contains("category-btn")) {
      document
        .querySelectorAll(".category-btn")
        .forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
      const category = e.target.dataset.category;
      displayProducts(products, category);
    }
  });

  document.getElementById("products-container").addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const productId = parseInt(e.target.closest(".product-card").dataset.id);
      addToCart(productId);
    }
  });

  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length > 0) {
      alert(
        "The order was completed successfully! Total: " +
          document.getElementById("cart-total").textContent
      );
      cart = [];
      updateCartCount();
      updateCartModal();
      bootstrap.Modal.getInstance(document.getElementById("cartModal")).hide();
    }
  });

  document.getElementById("cart-items").addEventListener("click", (e) => {
    const targetId = parseInt(e.target.dataset.id);

    if (e.target.classList.contains("increase-quantity")) {
      addToCart(targetId);
    } else if (e.target.classList.contains("decrease-quantity")) {
      const index = cart.findIndex((item) => item.id === targetId);
      if (index !== -1) {
        cart.splice(index, 1);
        updateCartCount();
        updateCartModal();
      }
    } else if (e.target.classList.contains("remove-item")) {
      cart = cart.filter((item) => item.id !== targetId);
      updateCartCount();
      updateCartModal();
    }
  });
});
