// JavaScript cho Đề thi Kết thúc Học phần Lập trình Web - Đề số 1
document.addEventListener('DOMContentLoaded', function() {
    // --- PHẦN 1: TÌM KIẾM SẢN PHẨM ---
    const products = [
        { id: 1, name: 'Áo thun Wuthering Waves Jinhsi', price: 250000, category: 'Apparel' },
        { id: 2, name: 'Móc khóa Acrylic Iuno', price: 90000, category: 'Goods' },
        { id: 3, name: 'Figure PVC Augusta Collector', price: 1200000, category: 'Figure' },
        { id: 4, name: 'Lót chuột gaming cỡ lớn Rover', price: 180000, category: 'Accessory' },
        { id: 5, name: 'Sách Artbook Wuthering Waves Vol.1', price: 450000, category: 'Book' }
    ];

    const searchInput = document.getElementById('productSearch');
    const productGrid = document.getElementById('productGrid');

    function renderProducts(items) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        if (items.length === 0) {
            productGrid.innerHTML = '<div class="error-msg">Không tìm thấy sản phẩm phù hợp với từ khóa của bạn.</div>';
            return;
        }
        items.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h4>${escapeHTML(p.name)}</h4>
                <p class="price">${p.price.toLocaleString('vi-VN')} VNĐ</p>
                <small>Danh mục: ${escapeHTML(p.category)}</small>
            `;
            productGrid.appendChild(card);
        });
    }

    // Hàm chống XSS Injection đơn giản cho input người dùng
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    if (searchInput) {
        renderProducts(products);
        searchInput.addEventListener('input', function(e) {
            const keyword = e.target.value.trim().toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
            renderProducts(filtered);
        });
    }


    // --- PHẦN 2: VALIDATE FORM ĐĂNG KÝ & LOCALSTORAGE ---
    const regForm = document.getElementById('registrationForm');
    const formAlert = document.getElementById('formAlert');

    if (regForm) {
        regForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const agree = document.getElementById('regAgree').checked;

            // Xóa thông báo lỗi cũ
            document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
            formAlert.style.display = 'none';

            let isValid = true;

            if (!name) {
                document.getElementById('errorName').textContent = 'Vui lòng nhập họ tên.';
                isValid = false;
            }

            // Regex email hợp lệ
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                document.getElementById('errorEmail').textContent = 'Email không hợp lệ.';
                isValid = false;
            }

            // Regex mật khẩu: ít nhất 8 ký tự, có chữ hoa, chữ thường, số
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                document.getElementById('errorPassword').textContent = 'Mật khẩu ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.';
                isValid = false;
            }

            if (!agree) {
                document.getElementById('errorAgree').textContent = 'Bạn phải đồng ý với điều khoản.';
                isValid = false;
            }

            if (isValid) {
                // Mã hóa cơ bản hoặc lưu trực tiếp vào localStorage (bảo mật dữ liệu cục bộ tránh plain-text nhạy cảm nếu cần)
                const userData = {
                    name: escapeHTML(name),
                    email: escapeHTML(email),
                    // Trong thực tế không lưu mật khẩu dạng plaintext vào localStorage, đây là mô phỏng theo yêu cầu đề bài
                    passwordHash: btoa(password), 
                    registeredAt: new Date().toISOString()
                };

                localStorage.setItem('vhu_registered_user', JSON.stringify(userData));

                formAlert.style.display = 'block';
                formAlert.textContent = 'Đăng ký thành công! Dữ liệu đã được lưu vào LocalStorage.';
                regForm.reset();
            }
        });
    }


    // --- PHẦN 3: ĐỒNG HỒ ĐẾM NGƯỢC (COUNTDOWN TIMER) ---
    const timerDisplay = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('startTimer');
    const resetBtn = document.getElementById('resetTimer');
    const timeoutModal = document.getElementById('timeoutModal');
    const closeModalBtn = document.getElementById('closeModal');

    let totalSeconds = 10 * 60; // 10 phút
    let timerInterval = null;
    let isRunning = false;

    function formatTime(secs) {
        const minutes = Math.floor(secs / 60);
        const seconds = secs % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimer() {
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(totalSeconds);
            
            // Animation khi dưới 1 phút (60 giây)
            if (totalSeconds <= 60 && totalSeconds > 0) {
                timerDisplay.classList.add('warning-animation');
            } else {
                timerDisplay.classList.remove('warning-animation');
            }

            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                timerDisplay.classList.remove('warning-animation');
                if (timeoutModal) {
                    timeoutModal.style.display = 'flex';
                }
            } else {
                totalSeconds--;
            }
        }
    }

    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (!isRunning) {
                if (totalSeconds <= 0) totalSeconds = 10 * 60;
                // Tránh memory leak bằng cách clear interval cũ trước khi tạo interval mới
                clearInterval(timerInterval);
                timerInterval = setInterval(updateTimer, 1000);
                isRunning = true;
                startBtn.textContent = 'Đang chạy...';
                startBtn.disabled = true;
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
            isRunning = false;
            totalSeconds = 10 * 60;
            if (timerDisplay) {
                timerDisplay.textContent = formatTime(totalSeconds);
                timerDisplay.classList.remove('warning-animation');
            }
            if (startBtn) {
                startBtn.textContent = 'Bắt đầu đếm ngược';
                startBtn.disabled = false;
            }
        });
    }

    if (closeModalBtn && timeoutModal) {
        closeModalBtn.addEventListener('click', function() {
            timeoutModal.style.display = 'none';
            if (startBtn) {
                startBtn.textContent = 'Bắt đầu đếm ngược';
                startBtn.disabled = false;
            }
        });
    }

    // Khởi tạo hiển thị ban đầu
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(totalSeconds);
    }
});
