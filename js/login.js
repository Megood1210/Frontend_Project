
if (localStorage.getItem("currentUser")) {
    let form = document.createElement("form");
    form.action = "index.html";
    form.method = "GET";
    document.body.appendChild(form);
    form.submit();
}

document.getElementById("loginForm").addEventListener("submit", function (event) { 
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let message = document.getElementById("loginMessage"); 

    if (email === "" || password === "") {
        message.textContent = "Vui lòng nhập đầy đủ thông tin";
        message.style.color = "red";
        return;
    }
    message.textContent = ""; 


    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === email && u.password === password);

    if (user) {
        Swal.fire({
            title: "Đăng nhập thành công",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });        
        localStorage.setItem("currentUser", JSON.stringify(user));

        setTimeout(() => {
            let form = document.createElement("form");
            form.action = "index.html";
            form.method = "GET";
            document.body.appendChild(form);
            form.submit();
        }, 2000);
    } else {
        message.textContent = " Sai tên đăng nhập hoặc mật khẩu";
        message.style.color = "red";
    }
});
