/**
 * AgriTrace - Main JavaScript
 * Xử lý các tương tác UI chung
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // Navbar scroll effect
    // ============================================
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ============================================
    // Auto-dismiss flash messages after 5 seconds
    // ============================================
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        }, 5000);
    });

    // ============================================
    // Form validation styles
    // ============================================
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // ============================================
    // Confirm delete dialogs
    // ============================================
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm-delete') || 'Bạn có chắc chắn muốn xóa?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // ============================================
    // Generate QR Code
    // ============================================
    window.generateQR = function(elementId, data, size) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '';
            new QRCode(element, {
                text: data,
                width: size || 150,
                height: size || 150,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    };

    // Auto-generate QR codes on page load
    const qrElements = document.querySelectorAll('[data-qr]');
    qrElements.forEach(function(el) {
        const data = el.getAttribute('data-qr');
        const size = parseInt(el.getAttribute('data-qr-size')) || 150;
        new QRCode(el, {
            text: data,
            width: size,
            height: size,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    });

    // ============================================
    // Smooth scroll for anchor links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============================================
    // Animate elements on scroll
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.observe-scroll').forEach(function(el) {
        observer.observe(el);
    });

    // ============================================
    // Search functionality (for product search)
    // ============================================
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    performSearch(query);
                }
            }, 300);
        });
    }

    // ============================================
    // Copy hash to clipboard
    // ============================================
    window.copyHash = function(text) {
        navigator.clipboard.writeText(text).then(function() {
            // Show toast
            showToast('Đã sao chép hash!');
        }).catch(function() {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Đã sao chép hash!');
        });
    };

    // ============================================
    // Toast notification
    // ============================================
    window.showToast = function(message, type) {
        type = type || 'success';
        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 p-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="toast show align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi bi-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} me-2"></i>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.remove();
        }, 3000);
    };

    // ============================================
    // Giai đoạn label mapping
    // ============================================
    window.getStageLabel = function(stage) {
        const labels = {
            'gieo_trong': 'Gieo trồng',
            'cham_soc': 'Chăm sóc',
            'thu_hoach': 'Thu hoạch',
            'dong_goi': 'Đóng gói',
            'van_chuyen': 'Vận chuyển',
            'phan_phoi': 'Phân phối'
        };
        return labels[stage] || stage;
    };

    window.getStageIcon = function(stage) {
        const icons = {
            'gieo_trong': 'bi-flower1',
            'cham_soc': 'bi-droplet-half',
            'thu_hoach': 'bi-basket2',
            'dong_goi': 'bi-box-seam',
            'van_chuyen': 'bi-truck',
            'phan_phoi': 'bi-shop'
        };
        return icons[stage] || 'bi-circle';
    };

    console.log('🌿 AgriTrace - Hệ thống truy xuất nguồn gốc nông sản');
});
