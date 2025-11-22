/**
 * OLIVE & ASH - MAIN JAVASCRIPT
 * Ultra-premium interactions and cart functionality
 */

// ===================================
// GLOBAL STATE MANAGEMENT
// ===================================

// Global cart variable accessible throughout the application
let cart;

class CartManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('oliveAshCart')) || [];
        this.updateCartDisplay();
    }

    addItem(productId, name, price, quantity = 1) {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: productId,
                name: name,
                price: parseFloat(price),
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showAddToCartFeedback(name);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('oliveAshCart', JSON.stringify(this.items));
    }

    updateCartDisplay() {
        const cartCount = document.querySelectorAll('.cart-count');
        const totalItems = this.getTotalItems();

        cartCount.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'flex' : 'none';
        });

        // If on cart page, render cart items
        this.renderCartItems();

        // Render slideout items
        this.renderSlideoutItems();
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        // Keep the header
        const header = cartItemsContainer.querySelector('.cart-header');
        cartItemsContainer.innerHTML = '';

        if (header) cartItemsContainer.appendChild(header);

        if (this.items.length === 0) return;

        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.setAttribute('data-product', item.id);

            itemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="assets/img/${item.id}.jpg" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-description">Premium olive wood utensil</p>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-action="decrease">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10">
                        <button class="quantity-btn" data-action="increase">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item" data-product="${item.id}">Remove</button>
                </div>
            `;

            cartItemsContainer.appendChild(itemElement);
        });

        // Re-setup event listeners for new elements
        this.setupCartItemListeners();
    }

    setupCartItemListeners() {
        const removeBtns = document.querySelectorAll('.remove-item');
        const quantityBtns = document.querySelectorAll('.quantity-btn[data-action]');

        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = e.target.dataset.product;
                this.removeItem(productId);
            });
        });

        quantityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.dataset.action;
                const cartItem = e.target.closest('.cart-item');
                const productId = cartItem.dataset.product;
                const quantityInput = cartItem.querySelector('.quantity-input');
                const currentQuantity = parseInt(quantityInput.value);

                if (action === 'increase') {
                    if (currentQuantity < 10) {
                        quantityInput.value = currentQuantity + 1;
                        this.updateQuantity(productId, currentQuantity + 1);
                    }
                } else if (action === 'decrease' && currentQuantity > 1) {
                    quantityInput.value = currentQuantity - 1;
                    this.updateQuantity(productId, currentQuantity - 1);
                }
            });
        });
    }

    renderSlideoutItems() {
        const slideoutBody = document.getElementById('slideoutCartItems');
        if (!slideoutBody) return;

        slideoutBody.innerHTML = '';

        if (this.items.length === 0) {
            slideoutBody.innerHTML = `<div class="slideout-empty">Your cart is empty</div>`;
            return;
        }

        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'slideout-cart-item';
            itemElement.setAttribute('data-product', item.id);

            itemElement.innerHTML = `
                <img src="assets/img/${item.id}.jpg" alt="${item.name}" class="slideout-item-image">
                <div class="slideout-item-details">
                    <h4>${item.name}</h4>
                    <div class="slideout-item-price">$${item.price.toFixed(2)}</div>
                    <div class="slideout-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <button class="slideout-remove-item" data-product="${item.id}">×</button>
            `;

            slideoutBody.appendChild(itemElement);
        });

        this.setupSlideoutListeners();

        // Update total
        const totalElement = document.querySelector('.slideout-total');
        if (totalElement) {
            totalElement.textContent = this.getTotalPrice().toFixed(2);
        }
    }

    setupSlideoutListeners() {
        const removeBtns = document.querySelectorAll('.slideout-remove-item');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = e.target.dataset.product;
                this.removeItem(productId);
            });
        });
    }

    showAddToCartFeedback(productName) {
        // Create and show feedback notification
        const notification = document.createElement('div');
        notification.className = 'cart-feedback';
        notification.innerHTML = `
            <div class="cart-feedback-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                <span>${productName} added to cart</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    getCartItems() {
        return this.items;
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===================================
// SMOOTH SCROLLING & NAVIGATION
// ===================================

class NavigationManager {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScrollY = window.scrollY;
        this.init();
    }

    init() {
        // Sticky header behavior
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 16));

        // Mobile menu toggle (if needed later)
        this.setupMobileMenu();
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Hide/show header based on scroll direction
        if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
            this.header.style.transform = 'translateY(-100%)';
        } else {
            this.header.style.transform = 'translateY(0)';
        }
        
        this.lastScrollY = currentScrollY;
    }

    setupMobileMenu() {
        // Placeholder for mobile menu functionality
        // Can be expanded later if needed
    }
}

// ===================================
// PRODUCT INTERACTIONS
// ===================================

class ProductInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupProductImageGallery();
        this.setupQuantityControls();
        this.setupAddToCartButtons();
        this.setupProductFilters();
        this.setupFavoriteButtons();
        this.setupProductTabs();
        this.setupWishlistButtons();
        this.setupMapInteractions();
        this.setupFormValidation();
        this.setupCartButton();
    }

    setupProductImageGallery() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('mainProductImage');
        const zoomOverlay = document.getElementById('imageZoomOverlay');
        const zoomImage = document.getElementById('zoomImage');
        const zoomClose = document.getElementById('zoomClose');
        
        if (!thumbnails.length || !mainImage) return;

        // Thumbnail click handlers
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                // Remove active class from all thumbnails
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                
                // Add active class to clicked thumbnail
                thumbnail.classList.add('active');
                
                // Update main image
                const newImageSrc = thumbnail.dataset.image;
                mainImage.src = newImageSrc;
                mainImage.alt = thumbnail.alt;
                
                // Update zoom image
                if (zoomImage) {
                    zoomImage.src = newImageSrc;
                    zoomImage.alt = thumbnail.alt;
                }
                
                // Add fade effect
                mainImage.style.opacity = '0.7';
                setTimeout(() => {
                    mainImage.style.opacity = '1';
                }, 150);
            });
        });

        // Zoom functionality
        if (mainImage && zoomOverlay && zoomImage && zoomClose) {
            // Click to zoom
            mainImage.addEventListener('click', () => {
                zoomOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });

            // Close zoom
            zoomClose.addEventListener('click', () => {
                zoomOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });

            // Click overlay to close
            zoomOverlay.addEventListener('click', (e) => {
                if (e.target === zoomOverlay) {
                    zoomOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && zoomOverlay.classList.contains('active')) {
                    zoomOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    setupQuantityControls() {
        // Product detail page quantity controls
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const quantityInput = document.getElementById('quantity');

        if (decreaseBtn && increaseBtn && quantityInput) {
            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });

            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue < 10) {
                    quantityInput.value = currentValue + 1;
                }
            });

            quantityInput.addEventListener('change', () => {
                const value = parseInt(quantityInput.value);
                if (value < 1) quantityInput.value = 1;
                if (value > 10) quantityInput.value = 10;
            });
        }

        // Cart page quantity controls
        const cartQuantityBtns = document.querySelectorAll('.quantity-btn[data-action]');
        
        cartQuantityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const cartItem = e.target.closest('.cart-item');
                const productId = cartItem.dataset.product;
                const quantityInput = cartItem.querySelector('.quantity-input');
                const currentQuantity = parseInt(quantityInput.value);

                if (action === 'increase') {
                    quantityInput.value = currentQuantity + 1;
                    cart.updateQuantity(productId, currentQuantity + 1);
                } else if (action === 'decrease' && currentQuantity > 1) {
                    quantityInput.value = currentQuantity - 1;
                    cart.updateQuantity(productId, currentQuantity - 1);
                }
            });
        });
    }

    setupAddToCartButtons() {
        const addToCartBtns = document.querySelectorAll('.add-to-cart');
        
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const productId = btn.dataset.product;
                const price = btn.dataset.price;
                const productCard = btn.closest('.product-card');
                const productName = productCard ? 
                    productCard.querySelector('.product-name').textContent :
                    btn.closest('.product-info-detailed').querySelector('.product-title').textContent;
                
                let quantity = 1;
                
                // Check if we're on product detail page
                const quantityInput = document.getElementById('quantity');
                if (quantityInput) {
                    quantity = parseInt(quantityInput.value);
                }
                
                cart.addItem(productId, productName, price, quantity);
                
                // Add visual feedback to button
                this.animateAddToCartButton(btn);
            });
        });
    }

    animateAddToCartButton(btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.style.background = 'var(--color-olive)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
    }

    setupProductFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        if (!filterBtns.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter products
                const products = document.querySelectorAll('.product-card');
                
                products.forEach(product => {
                    if (filter === 'all') {
                        product.style.display = 'block';
                    } else {
                        const category = product.dataset.category;
                        if (category === filter) {
                            product.style.display = 'block';
                        } else {
                            product.style.display = 'none';
                        }
                    }
                });
                
                // Animate filtered products
                this.animateFilteredProducts();
            });
        });
    }

    animateFilteredProducts() {
        const visibleProducts = document.querySelectorAll('.product-card[style*="block"]');
        
        visibleProducts.forEach((product, index) => {
            product.style.opacity = '0';
            product.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                product.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                product.style.opacity = '1';
                product.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    setupFavoriteButtons() {
        const favoriteBtns = document.querySelectorAll('.product-favorite');
        
        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle favorite state
                btn.classList.toggle('favorited');
                
                // Add animation
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 200);
                
                // Here you could add functionality to save favorites
                // For now, just visual feedback
            });
        });
    }

    setupCartButton() {
        const cartButton = document.getElementById('cartButton');
        const closeSlideout = document.getElementById('closeSlideout');
        const slideoutCheckoutBtn = document.getElementById('slideoutCheckoutBtn');

        if (cartButton) {
            cartButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCartSlideout();
            });
        }

        if (closeSlideout) {
            closeSlideout.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCartSlideout();
            });
        }

        if (slideoutCheckoutBtn) {
            slideoutCheckoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiateStripeCheckout();
            });
        }
    }

    initiateStripeCheckout() {
        // Navigate to cart page for full checkout process
        window.location.href = 'cart.html';
    }

    toggleCartSlideout() {
        const slideout = document.getElementById('cartSlideout');
        if (slideout) {
            slideout.classList.toggle('active');
        }
    }

    closeCartSlideout() {
        const slideout = document.getElementById('cartSlideout');
        if (slideout) {
            slideout.classList.remove('active');
        }
    }
}

// ===================================
// CART PAGE FUNCTIONALITY
// ===================================

class CartPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupRemoveButtons();
        this.setupCheckoutButton();
        this.updateCartDisplay();
    }

    setupRemoveButtons() {
        const removeBtns = document.querySelectorAll('.remove-item');
        
        removeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.product;
                cart.removeItem(productId);
                this.updateCartDisplay();
            });
        });
    }

    setupCheckoutButton() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                // Mock checkout process
                this.showCheckoutModal();
            });
        }
    }

    updateCartDisplay() {
        const cartItems = cart.getCartItems();
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCartContainer = document.getElementById('emptyCart');
        const cartSummary = document.getElementById('cartSummary');
        
        if (cartItems.length === 0) {
            cartItemsContainer.style.display = 'none';
            cartSummary.style.display = 'none';
            emptyCartContainer.style.display = 'block';
        } else {
            cartItemsContainer.style.display = 'block';
            cartSummary.style.display = 'block';
            emptyCartContainer.style.display = 'none';
            
            this.updateCartTotals();
        }
    }

    updateCartTotals() {
        const subtotal = cart.getTotalPrice();
        const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;
        
        // Update display
        document.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
        document.querySelector('.tax').textContent = `$${tax.toFixed(2)}`;
        document.querySelector('.total').textContent = `$${total.toFixed(2)}`;
    }

    showCheckoutModal() {
        // Create and show checkout modal
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="checkout-modal-content">
                <div class="checkout-modal-header">
                    <h2>Checkout</h2>
                    <button class="checkout-modal-close">&times;</button>
                </div>
                <div class="checkout-modal-body">
                    <p>Thank you for your interest in our products!</p>
                    <p>In a real implementation, this would redirect to a secure checkout process.</p>
                    <div class="checkout-summary">
                        <p><strong>Total Items:</strong> ${cart.getTotalItems()}</p>
                        <p><strong>Total Price:</strong> $${cart.getTotalPrice().toFixed(2)}</p>
                    </div>
                </div>
                <div class="checkout-modal-footer">
                    <button class="btn btn-secondary checkout-modal-close">Continue Shopping</button>
                    <button class="btn btn-primary">Proceed to Payment</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtns = modal.querySelectorAll('.checkout-modal-close');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }
}

// ===================================
// FORM HANDLING
// ===================================

class FormManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupContactForm();
        this.setupNewsletterForm();
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Basic validation
            if (!name || !email || !subject || !message) {
                this.showFormMessage('Please fill in all required fields.', 'error');
                return;
            }
            
            // Mock form submission
            this.submitContactForm({ name, email, subject, message });
        });
    }

    setupNewsletterForm() {
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        
        newsletterForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const emailInput = form.querySelector('input[type="email"]');
                const email = emailInput.value;
                
                if (!email || !this.isValidEmail(email)) {
                    this.showFormMessage('Please enter a valid email address.', 'error');
                    return;
                }
                
                // Mock newsletter signup
                this.submitNewsletterForm(email);
                emailInput.value = '';
            });
        });
    }

    submitContactForm(data) {
        // Show loading state
        const submitBtn = document.querySelector('#contactForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Mock API call
        setTimeout(() => {
            this.showFormMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
            document.getElementById('contactForm').reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    submitNewsletterForm(email) {
        // Show loading state
        const submitBtns = document.querySelectorAll('.newsletter-form button[type="submit"]');
        submitBtns.forEach(btn => {
            const originalText = btn.textContent;
            btn.textContent = 'Subscribing...';
            btn.disabled = true;
            
            setTimeout(() => {
                this.showFormMessage('Thank you for subscribing to our newsletter!', 'success');
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1000);
        });
    }

    showFormMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message--${type}`;
        messageEl.textContent = message;
        
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Add new message
        document.body.appendChild(messageEl);
        
        // Show message
        setTimeout(() => {
            messageEl.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 4000);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

class ScrollAnimations {
    constructor() {
        this.animatedElements = [];
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.observeElements();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    observeElements() {
        const elementsToAnimate = document.querySelectorAll('.featured-card, .product-card, .blog-post, .process-step, .value-card, .faq-item, .feature-item');
        
        elementsToAnimate.forEach((element, index) => {
            element.classList.add('animate-on-scroll');
            element.style.transitionDelay = `${index * 0.1}s`;
            this.observer.observe(element);
        });
    }
}

// ===================================
// PERFORMANCE OPTIMIZATIONS
// ===================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalImages();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    preloadCriticalImages() {
        const criticalImages = [
            'assets/img/olive-wood-collection.jpg',
            'assets/img/spatula-detail.jpg',
            'assets/img/wood-texture.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
}

// ===================================
// INITIALIZATION
// ===================================

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functionality
    cart = new CartManager();
    const navigation = new NavigationManager();
    const productInteractions = new ProductInteractions();
    const formManager = new FormManager();
    const scrollAnimations = new ScrollAnimations();
    const performanceOptimizer = new PerformanceOptimizer();
    
    // Initialize cart page if on cart page
    if (document.querySelector('.cart-content')) {
        const cartPage = new CartPage();
    }
    
    // Add CSS for cart feedback and form messages
    addDynamicStyles();
    
    console.log('🍃 Olive & Ash website initialized successfully');
});

// ===================================
// DYNAMIC STYLES
// ===================================

function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .cart-feedback {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--color-accent);
            color: var(--color-text-light);
            padding: 12px 20px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1001;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .cart-feedback.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .form-message {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 12px 20px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1001;
            font-weight: 500;
            max-width: 300px;
        }
        
        .form-message--success {
            background: #28a745;
            color: white;
        }
        
        .form-message--error {
            background: #dc3545;
            color: white;
        }
        
        .form-message.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .checkout-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .checkout-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .checkout-modal-content {
            background: white;
            border-radius: var(--radius-lg);
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .checkout-modal.show .checkout-modal-content {
            transform: scale(1);
        }
        
        .checkout-modal-header {
            padding: var(--spacing-lg);
            border-bottom: 1px solid var(--color-border-light);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .checkout-modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--color-text-secondary);
        }
        
        .checkout-modal-body {
            padding: var(--spacing-lg);
        }
        
        .checkout-modal-footer {
            padding: var(--spacing-lg);
            border-top: 1px solid var(--color-border-light);
            display: flex;
            gap: var(--spacing-md);
            justify-content: flex-end;
        }
        
        .checkout-summary {
            background: var(--color-bg-accent);
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            margin-top: var(--spacing-md);
        }
        
        .header.scrolled {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: var(--shadow-sm);
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .product-favorite.favorited {
            background: var(--color-accent) !important;
            color: var(--color-text-light) !important;
        }
        
        .lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .lazy.loaded {
            opacity: 1;
        }
        
        .cart-slideout {
            position: fixed;
            top: 0;
            right: -400px;
            width: 350px;
            height: 100vh;
            background: white;
            box-shadow: var(--shadow-lg);
            z-index: 1500;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .cart-slideout.active {
            right: 0;
        }

        .cart-slideout-header {
            padding: var(--spacing-lg);
            border-bottom: 1px solid var(--color-border-light);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--color-bg-accent);
        }

        .cart-slideout-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--color-text-secondary);
            padding: 5px;
        }

        .cart-slideout-body {
            flex: 1;
            overflow-y: auto;
            padding: var(--spacing-md);
        }

        .slideout-cart-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--color-border-light);
        }

        .slideout-item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: var(--radius-md);
        }

        .slideout-item-details {
            flex: 1;
        }

        .slideout-item-details h4 {
            margin: 0 0 4px 0;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .slideout-item-price,
        .slideout-item-quantity {
            font-size: 0.8rem;
            color: var(--color-text-secondary);
            margin: 2px 0;
        }

        .slideout-remove-item {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: var(--color-text-secondary);
            padding: 5px;
        }

        .slideout-empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--color-text-secondary);
            font-style: italic;
        }

        .cart-slideout-footer {
            padding: var(--spacing-lg);
            border-top: 1px solid var(--color-border-light);
            background: var(--color-bg-light);
        }

        .cart-slideout-total {
            text-align: center;
            font-weight: 600;
            margin-bottom: var(--spacing-md);
            font-size: 1.1rem;
        }

        .cart-slideout-actions {
            display: flex;
            gap: var(--spacing-sm);
        }

        .cart-slideout-actions .btn {
            flex: 1;
            padding: 10px;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .cart-feedback,
            .form-message {
                right: 10px;
                left: 10px;
                max-width: none;
            }

            .checkout-modal-footer {
                flex-direction: column;
            }

            .cart-slideout {
                width: 100%;
                right: -100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ===================================
// EXPORTS FOR EXTERNAL USE
// ===================================

// Make cart globally accessible for debugging
window.OliveAshCart = CartManager;
