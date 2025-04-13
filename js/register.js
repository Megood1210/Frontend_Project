document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let confirmPassword = document.getElementById("confirmPassword").value.trim();
    let message = document.getElementById("message");
    let emailError = document.getElementById("emailError");
    let passwordError = document.getElementById("passwordError");
    let confirmPasswordError = document.getElementById("confirmPasswordError");

    // Reset lỗi
    message.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";

    let hasError = false;

    // Kiểm tra email rỗng
    if (email === "") {
        emailError.textContent = "Email không được để trống";
        emailError.style.color = "red";
        hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = "Email không đúng định dạng";
        emailError.style.color = "red";
        hasError = true;
    }

    // Kiểm tra mật khẩu
    if (password.length < 6) {
        passwordError.textContent = "Mật khẩu phải có ít nhất 6 ký tự";
        passwordError.style.color = "red";
        hasError = true;
    }

    // Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
        confirmPasswordError.textContent = "Mật khẩu xác nhận không khớp";
        confirmPasswordError.style.color = "red";
        hasError = true;
    }

    // Nếu có lỗi thì không xử lý tiếp
    if (hasError) return;

    // Kiểm tra trùng email
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let existingUser = users.find(u => u.email === email);

    if (existingUser) {
        message.textContent = "Email đã tồn tại";
        message.style.color = "red";
        return;
    }

    // Lưu người dùng
    users.push({ email, password });
    localStorage.setItem("users", JSON.stringify(users));
    message.textContent = "Đăng ký thành công";
    message.style.color = "green";

    setTimeout(() => {
        document.getElementById("registerForm").action = "login.html";
        document.getElementById("registerForm").submit();
    }, 900);
});
