function toggleDropdown() {
    let dropdown = document.getElementById("dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}
function confirmLogout() {
    // Xóa tài khoản khỏi localStorage
    localStorage.removeItem("currentUser"); 
    window.location.href = 'login.html';
}

let budgets = {};

function saveBudget() {
    let month = document.getElementById("selectedMonth").value;
    let budget = document.getElementById("budget").value;
    if (!budget || budget <= 0) {
        Swal.fire({
            title: "Số tiền không hợp lệ",
            icon: "error"
          });
        return;
    }
    budgets[month] = {
        total: parseInt(budget),
        remaining: parseInt(budget)
    };
    updateRemainingMoney(month);
}

function updateRemainingMoney(month) {
    let moneyDisplay = document.getElementById("remainingMoney");
    if (budgets[month]) {
        moneyDisplay.textContent = budgets[month].remaining.toLocaleString() + " VND";
    }
}

const categoryNameInput = document.getElementById("categoryName");
const categoryLimitInput = document.getElementById("categoryLimit");
const addCategoryBtn = document.getElementById("addCategory");
const categoryList = document.getElementById("categoryList");
let editingItem = null;

function createCategoryItem(name, limit, spent = 0) {
    const li = document.createElement("li");
    li.classList.add("category-item");
    li.innerHTML = `
    <div class="category-info">
        <span class="category-name">${name}</span> -
        <span class="category-limit">Giới hạn: ${Number(limit).toLocaleString()} VND</span>
    </div>
    <span class="actions">
        <span class="edit">Sửa</span>
        <span class="delete">Xóa</span>
    </span>
`;
    categoryList.appendChild(li);
    addEventsToItem(li);
}

function addEventsToItem(item) {
    item.querySelector(".edit").onclick = function () {
        categoryNameInput.value = item.querySelector(".category-name").textContent;
        categoryLimitInput.value = item.querySelector(".category-limit").textContent.replace("Giới hạn: ", "").replace(" VND", "").replace(/,/g, "");
        editingItem = item;
        addCategoryBtn.textContent = "Cập nhật danh mục";
};
    item.querySelector(".delete").onclick = function () {
        if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            item.remove();
        }
    };  
}

function addEventsToCategories() {
    document.querySelectorAll(".category-item").forEach(addEventsToItem);
}

// Gán sự kiện cho danh mục mặc định khi trang tải
addEventsToCategories();

    const itemsPerPage = 2;
    let currentPage = 2; // Trang mặc định là trang 2

    const transactionList = document.querySelector(".transaction-list");

    function renderTransactions() {
        transactionList.innerHTML = "";

        if (currentPage === 1) {
            updatePageStyles();
            return;
        }

        let start = (currentPage - 2) * itemsPerPage;
        let end = start + itemsPerPage;
        let pageItems = transactions.slice(start, end);

        pageItems.forEach(item => {
            const li = document.createElement("li");
            li.classList.add("transaction-item");
            li.innerHTML = `${item} <span class="delete-button">Xoá</span>`;
            transactionList.appendChild(li);
        });

        updatePageStyles();
    }

    function updatePageStyles() {
        document.querySelectorAll(".pagination button").forEach(btn => {
            btn.classList.remove("active");
        });
        if (currentPage === 1) document.querySelector(".btn-2").classList.add("active");
        else if (currentPage === 2) document.querySelector(".btn-3").classList.add("active");
        else if (currentPage === 3) document.querySelector(".btn-4").classList.add("active");
    }

renderTransactions();
let editIndex = -1;

document.addEventListener("DOMContentLoaded", function () {
    renderCategories();

    document.getElementById("addCategory").addEventListener("click", () => {
        const name = document.getElementById("categoryName").value.trim();
        const limitStr = document.getElementById("categoryLimit").value.trim();
        const limit = parseInt(limitStr);
        const monthKey = getMonthKey();
        let data = loadData(monthKey) || { budget: 0, categories: [] };

        if (!/^[a-zA-ZÀ-ỹ\s.,-]+$/.test(name)) {
            Swal.fire({
                title: "Tên danh mục không được để trống",
                icon: "error"
            });
            return;
        }

        if(!limit){
            Swal.fire({
                title: "Giới hạn không được để trống",
                icon: "error"
            });
            return; 
        }

        const totalCurrent = data.categories.reduce((sum, cat, index) => {
            if (index === editIndex) return sum;
            return sum + parseInt(cat.limit);
        }, 0);

        const remainingBudget = (data.budget || 0) - totalCurrent;

        if (limit > remainingBudget) {
            Swal.fire({
                title: "Giới hạn không được lớn hơn số tiền còn lại",
                icon: "error"
            });
            return;
        }

        if (editIndex === -1) {
            // THÊM MỚI
            const isDuplicate = data.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
            if (isDuplicate) {
                Swal.fire({
                    title: "Tên danh mục đã tồn tại",
                    icon: "error"
                });
                return; 
            }
            data.categories.push({ name, limit });
        } else {
            // CẬP NHẬT
            data.categories[editIndex] = { name, limit };
            editIndex = -1;
            document.getElementById("addCategory").textContent = "Thêm danh mục";
        }

        saveData(monthKey, data);
        renderCategories();
        document.getElementById("categoryName").value = "";
        document.getElementById("categoryLimit").value = "";
    });

    document.getElementById("selectedMonth").addEventListener("change", () => {
        editIndex = -1;
        document.getElementById("addCategory").textContent = "Thêm danh mục";
        document.getElementById("categoryName").value = "";
        document.getElementById("categoryLimit").value = "";
        renderCategories();
        renderTransactions();
    });
    renderTransactions();
});

function getMonthKey() {
    const selectedMonth = document.getElementById("selectedMonth").value;
    return `finance_${selectedMonth}`;
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : null;
}

function renderCategories() {
    const monthKey = getMonthKey();
    let data = loadData(monthKey) || { budget: 0, categories: [] };

    // Gán ngân sách và tính số tiền còn lại
    document.getElementById("budget").value = data.budget || "";
    const remaining = (data.budget || 0) - data.categories.reduce((sum, cat) => sum + parseInt(cat.limit), 0);
    document.getElementById("remainingMoney").textContent = remaining.toLocaleString() + " VND";

    const list = document.getElementById("categoryList");
    list.innerHTML = "";

    data.categories.forEach((cat, i) => {
        const li = document.createElement("li");
        li.className = "category-item";
        li.innerHTML = `
            <div class="category-info">
                <span class="category-name">${cat.name}</span> -
                <span class="category-limit">Giới hạn: ${parseInt(cat.limit).toLocaleString()} VND</span>
            </div>
            <span class="actions">
                <span class="edit" data-index="${i}">Sửa</span>
                <span class="delete" data-index="${i}">Xoá</span>
            </span>
        `;
        list.appendChild(li);
    });

    document.querySelectorAll(".edit").forEach(btn => {
        btn.addEventListener("click", handleEdit);
    });

    document.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", handleDelete);
    });
    updateCategorySelect(data.categories);
}

function renderTransactions() {
transactionList.innerHTML = "";

const searchValue = document.querySelector(".search-bar").value.trim().toLowerCase();
const sortOption = document.querySelector(".sort-button").value;

const monthKey = getMonthKey();
let data = loadData(monthKey) || { transactions: [] };
let filtered = data.transactions || [];

if (searchValue) {
    filtered = filtered.filter(tran => tran.toLowerCase().includes(searchValue));
}

if (sortOption === "asc" || sortOption === "desc") {
    filtered.sort((a, b) => {
        const getAmount = (str) => {
            const match = str.match(/([\d,.]+) VND/);
            return match ? parseInt(match[1].replace(/,/g, '')) : 0;
        };
        const aAmount = getAmount(a);
        const bAmount = getAmount(b);
        return sortOption === "asc" ? aAmount - bAmount : bAmount - aAmount;
    });
}

const totalPages = Math.ceil(filtered.length / itemsPerPage);
if (currentPage > totalPages) currentPage = totalPages;

const start = (currentPage - 1) * itemsPerPage;
const end = start + itemsPerPage;
const pageItems = filtered.slice(start, end);

pageItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("transaction-item");
    li.innerHTML = `${item} <span class="delete-button" data-index="${start + index}">Xoá</span>`;
    transactionList.appendChild(li);
});

updatePagination(totalPages);
}

document.querySelector(".search-button").addEventListener("click", () => {
    currentPage = 1; // reset về trang 1 mỗi lần tìm
    renderTransactions();
});

function handleEdit(event) {
    const index = event.target.getAttribute("data-index");
    const monthKey = getMonthKey();
    let data = loadData(monthKey);
    const cat = data.categories[index];

    document.getElementById("categoryName").value = cat.name;
    document.getElementById("categoryLimit").value = cat.limit;
    document.getElementById("addCategory").textContent = "Cập nhật danh mục";
    editIndex = parseInt(index);
}

function handleDelete(event) {
    const index = event.target.getAttribute("data-index");
    const monthKey = getMonthKey();
    let data = loadData(monthKey);
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
        Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
        });
        data.categories.splice(index, 1);
        saveData(monthKey, data);
        renderCategories();
        }
    });
}

function saveBudget() {
    const monthKey = getMonthKey();
    let data = loadData(monthKey) || { budget: 0, categories: [] };
    const budgetValue = parseInt(document.getElementById("budget").value);
    if (!isNaN(budgetValue)) {
        data.budget = budgetValue;
        saveData(monthKey, data);
        renderCategories();
    } else {
        Swal.fire({
            title: "Ngân sách không hợp lệ",
            icon: "error"
        });
    }
}

const categorySelect = document.querySelector(".money-spend");
const categoryInput = document.getElementById("categoryInput");
const addMoneyBtn = document.querySelector(".btn-add-money");
const amountInput = document.querySelector(".money-spent input[placeholder='Số tiền']");
const noteInput = document.querySelector(".money-spent input[placeholder='Ghi chú']");

// ==== Lưu danh mục & giao dịch ====
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// ==== Hiển thị lại lịch sử giao dịch ====

function updatePageStyles() {
    document.querySelectorAll(".pagination button").forEach(btn => {
        btn.classList.remove("active");
    });
    if (currentPage === 1) document.querySelector(".btn-2").classList.add("active");
    else if (currentPage === 2) document.querySelector(".btn-3").classList.add("active");
    else if (currentPage === 3) document.querySelector(".btn-4").classList.add("active");
}

// ==== Thêm giao dịch mới ====
addMoneyBtn.addEventListener("click", () => {
const amount = amountInput.value.trim();
const selectedCategory = categorySelect.value;
const note = noteInput.value.trim();

if (amount === "" || selectedCategory === "") {
    Swal.fire({
        title: "Số tiền hoặc tên danh mục không được để trống",
        icon: "error"
    });
    return;
}

const transactionText = `${selectedCategory} - ${note ? note + ": " : ""}${Number(amount).toLocaleString()} VND`;

const monthKey = getMonthKey();
let data = loadData(monthKey) || { budget: 0, categories: [], transactions: [] };

// Nếu chưa có mảng transactions thì tạo
if (!Array.isArray(data.transactions)) data.transactions = [];

data.transactions.push(transactionText);
saveData(monthKey, data);
renderTransactions();

amountInput.value = "";
noteInput.value = "";
categorySelect.selectedIndex = 0;
});

// ==== Xoá giao dịch khi bấm "Xoá" ====
transactionList.addEventListener("click", (e) => {
if (e.target.classList.contains("delete-button")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    const monthKey = getMonthKey();
    let data = loadData(monthKey) || { transactions: [] };

    Swal.fire({
        title: "Bạn có chắc muốn xoá giao dịch này?",
        text: "Thao tác này không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xoá",
        cancelButtonText: "Huỷ",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
    }).then((result) => {
        if (result.isConfirmed) {
            if (Array.isArray(data.transactions)) {
                data.transactions.splice(index, 1);
                saveData(monthKey, data);
                renderTransactions();
            }

            Swal.fire({
                title: "Đã xoá!",
                text: "Giao dịch đã được xoá thành công.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}
});

function updateCategorySelect(categoryArray) {
    categorySelect.innerHTML = '<option value="">Tiền chi tiêu</option>';
    categoryArray.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.name;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}

function updatePagination(totalPages) {
    const pagination = document.querySelector(".pagination");
    pagination.innerHTML = "";

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.classList.add("btn-prev");
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTransactions();
        }
    });
    pagination.appendChild(prevBtn);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.classList.add("btn-page");
        if (i === currentPage) pageBtn.classList.add("active");
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            renderTransactions();
        });
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.classList.add("btn-next");
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTransactions();
        }
    });
    pagination.appendChild(nextBtn);
}

document.getElementById("selectedMonth").addEventListener("change", () => {
    currentPage = 1;
    renderTransactions();
});

function loadTransactions(month) {
    const data = localStorage.getItem("transactions-" + month);
    return data ? JSON.parse(data) : [];
}

function renderTransactionHistory(transactions) {
    const historyList = document.getElementsByClassName("transaction-list");
    historyList.innerHTML = "";

    transactions.forEach(transaction => {
        const div = document.createElement("div");
        div.classList.add("transaction-item");
        div.innerHTML = `
        <div>${transaction.name}</div>
        <div>${transaction.amount.toLocaleString()} đ</div>
        <div>${transaction.category}</div>
        `;
        historyList.appendChild(div);
    });

setupPagination(transactions); // nếu có phân trang
}

document.addEventListener("DOMContentLoaded", () => {
    const selectedMonth = document.getElementById("selectedMonth");
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // định dạng YYYY-MM
    selectedMonth.value = currentMonth;

    // Gọi hiển thị dữ liệu ban đầu
    renderCategories();
    renderTransactions();
});

document.addEventListener("DOMContentLoaded", () => {
    const selectedMonth = document.getElementById("selectedMonth");
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // định dạng YYYY-MM
    selectedMonth.value = currentMonth;

    // Gọi hiển thị dữ liệu ban đầu
    renderCategories();
    renderTransactions();
});


// ==== Gọi khi tải trang ====
renderCategories();
renderTransactions();